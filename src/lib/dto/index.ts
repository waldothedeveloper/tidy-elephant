import "server-only";

import { auth } from "@clerk/nextjs/server";

async function isUserAuthenticated() {
  const { userId } = await auth();
  return !!userId;
}

async function canSeeFirstName() {
  return (await isUserAuthenticated()) ? true : false;
}

async function canSeeLastName() {
  return (await isUserAuthenticated()) ? true : false;
}

async function canSeeAbout() {
  return (await isUserAuthenticated()) ? true : false;
}

async function canSeePhoto() {
  return (await isUserAuthenticated()) ? true : false;
}

export const provideUserBasicProfileDTO = () => {
  return {
    canSeeFirstName,
    canSeeLastName,
    canSeeAbout,
    canSeePhoto,
  };
};
