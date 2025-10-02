"use client";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { saveBusinessInfoAction } from "@/app/actions/onboarding/save-business-info-action";
import { lookupTwilioPhoneNumberAction } from "@/app/actions/onboarding/twilio-lookup-phone";
import { convertToE164, formatPhoneNumber } from "@/app/utils";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  businessInfoFormSchema,
  type BusinessInfoFormInput,
} from "./business-info-schema";

const formatEINNumberInput = (value: string) => {
  const digits = value.replace(/\D/g, "");
  const limitedDigits = digits.slice(0, 9);

  if (limitedDigits.length > 2) {
    return `${limitedDigits.slice(0, 2)}-${limitedDigits.slice(2)}`;
  }
  return limitedDigits;
};

const businessTypeOptions = [
  { value: "sole_proprietorship", label: "Sole Proprietorship" },
  { value: "partnership", label: "Partnership" },
  { value: "llc", label: "LLC (Limited Liability Company)" },
  { value: "corporation", label: "Corporation (C-Corp)" },
  { value: "s_corporation", label: "S-Corporation" },
  { value: "other", label: "Other" },
];

export default function BusinessInfoPage() {
  const [isPending, startTransition] = useTransition();
  const [phoneVerificationStatus, setPhoneVerificationStatus] = useState<{
    isVerifying: boolean;
    verified: boolean;
    error?: string;
  }>({
    isVerifying: false,
    verified: false,
  });

  const [displayPhoneNumber, setDisplayPhoneNumber] = useState("");

  const router = useRouter();

  const form = useForm<BusinessInfoFormInput>({
    resolver: valibotResolver(businessInfoFormSchema),
    mode: "onChange",
    defaultValues: {
      businessType: "llc",
      businessTypeOther: "",
      businessName: "",
      businessPhone: "",
      employerEin: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "US",
    },
  });

  const { isDirty, isValid } = form.formState;

  const watchBusinessType = form.watch("businessType");
  const showOtherBusinessType = watchBusinessType === "other";

  const verifyPhoneNumber = async (phoneNumber: string) => {
    if (phoneNumber.length !== 14) return;

    setPhoneVerificationStatus({ isVerifying: true, verified: false });

    try {
      const e164Phone = convertToE164(phoneNumber);
      const result = await lookupTwilioPhoneNumberAction(e164Phone);

      if (result.success) {
        setPhoneVerificationStatus({
          isVerifying: false,
          verified: true,
        });

        if (result.e164Format) {
          form.setValue("businessPhone", result.e164Format);
        }

        setDisplayPhoneNumber(phoneNumber);

        toast.success(`Your business phone has been successfully verified!`);
      } else {
        setPhoneVerificationStatus({
          isVerifying: false,
          verified: false,
          error: result.error,
        });
        toast.error(result.error || "Phone verification failed");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Phone verification failed";
      setPhoneVerificationStatus({
        isVerifying: false,
        verified: false,
        error: errorMessage,
      });
      toast.error(errorMessage);
    }
  };

  async function onSubmit(values: BusinessInfoFormInput) {
    startTransition(async () => {
      const result = await saveBusinessInfoAction(values);

      if (result.success) {
        toast.success(
          result.message || "Business information saved successfully!"
        );
        router.push("/onboarding/select-categories");
      } else {
        toast.error(result.error || "Something went wrong. Please try again.");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mt-6 flex items-center justify-end gap-x-6">
            <SignedIn>
              <UserButton />
            </SignedIn>
            <Button
              variant={!isDirty || !isValid ? "outline" : "default"}
              disabled={isPending || !isDirty || !isValid}
              type="submit"
            >
              {isPending && <Loader2Icon className="animate-spin" />}
              Submit & Next Step
            </Button>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="pb-12">
            <span className="mt-2 text-sm text-muted-foreground">
              Business Information
            </span>
            <h2 className="mt-2 text-3xl font-semibold text-foreground">
              Tell us about your business
            </h2>
            <p className="mt-2 max-w-4xl text-sm text-foreground">
              Help us understand your business structure and contact
              information. This information will be used for verification and
              client communication.
            </p>
          </div>

          <div>
            <div className="space-y-12 max-w-4xl">
              <div className="pb-12">
                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                  {/* Business Type */}
                  <div className="sm:col-span-1">
                    <FormField
                      control={form.control}
                      name="businessType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type of Business</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              if (value !== "other") {
                                form.setValue("businessTypeOther", "");
                              }
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select business type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {businessTypeOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Other Business Type (conditional) */}
                  {showOtherBusinessType && (
                    <div className="sm:col-span-1">
                      <FormField
                        control={form.control}
                        name="businessTypeOther"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Specify Business Type</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="Please specify your business type"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Business Name */}
                  <div className="sm:col-span-1">
                    <FormField
                      control={form.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              autoComplete="organization"
                              placeholder="ABC Organizing Services LLC"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter your business name as it appears on your
                            business registration
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* EIN */}
                  <div className="sm:col-span-1">
                    <FormField
                      control={form.control}
                      name="employerEin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Employer Identification Number (EIN)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="12-3456789"
                              maxLength={10}
                              value={field.value}
                              onChange={(e) => {
                                const formatted = formatEINNumberInput(
                                  e.target.value
                                );
                                field.onChange(formatted);
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Format: XX-XXXXXXX (e.g., 12-3456789)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Business Phone */}
                  <div className="sm:col-span-1">
                    <FormField
                      control={form.control}
                      name="businessPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Phone Number</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="tel"
                                autoComplete="tel"
                                placeholder="(123) 456-7890"
                                maxLength={14}
                                value={
                                  phoneVerificationStatus.verified
                                    ? displayPhoneNumber
                                    : field.value
                                }
                                onChange={(e) => {
                                  const formatted = formatPhoneNumber(
                                    e.target.value
                                  );
                                  setDisplayPhoneNumber(formatted);
                                  field.onChange(formatted);
                                  setPhoneVerificationStatus({
                                    isVerifying: false,
                                    verified: false,
                                  });
                                }}
                                onBlur={() =>
                                  verifyPhoneNumber(
                                    phoneVerificationStatus.verified
                                      ? displayPhoneNumber
                                      : field.value
                                  )
                                }
                                className={
                                  phoneVerificationStatus.verified
                                    ? "border-green-500"
                                    : phoneVerificationStatus.error
                                      ? "border-red-500"
                                      : ""
                                }
                              />
                              {phoneVerificationStatus.isVerifying && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                  <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
                                </div>
                              )}
                              {phoneVerificationStatus.verified && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                  <span className="text-green-600 text-sm">
                                    ✓
                                  </span>
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Business Address Section */}
                  <div className="col-span-full">
                    <h3 className="text-base font-semibold leading-7 text-foreground">
                      Business Address
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Enter your business address as it appears on your business
                      registration.
                    </p>
                  </div>

                  {/* Address Line 1 */}
                  <div className="col-span-full">
                    <FormField
                      control={form.control}
                      name="addressLine1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input
                              className="dark:text-background"
                              type="text"
                              autoComplete="address-line1"
                              placeholder="123 Main Street"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Address Line 2 */}
                  <div className="col-span-full">
                    <FormField
                      control={form.control}
                      name="addressLine2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address Line 2 (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              className="dark:text-background"
                              type="text"
                              autoComplete="address-line2"
                              placeholder="Suite 100, Apt 2B, etc."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* City, State, ZIP */}
                  <div className="sm:col-span-1">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input
                              className="dark:text-background"
                              type="text"
                              autoComplete="address-level2"
                              placeholder="New York"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input
                              className="dark:text-background"
                              type="text"
                              autoComplete="address-level1"
                              placeholder="NY"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code</FormLabel>
                          <FormControl>
                            <Input
                              className="dark:text-background"
                              type="text"
                              autoComplete="postal-code"
                              placeholder="10001"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Country - Hidden field, always US */}
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormControl>
                        <input type="hidden" {...field} />
                      </FormControl>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
