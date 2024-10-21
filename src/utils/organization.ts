import { error } from "../error.ts";
import type { API } from "./api.ts";
import type { Organization } from "./api_types.ts";
import { interruptSpinner, wait } from "./spinner.ts";

export default {
  getByNameOrCreate: async (
    api: API,
    name: string,
  ): Promise<Organization> => {
    const interruptedSpinner = interruptSpinner();
    let org;
    try {
      let spinner = wait(
        `You have specified the organization ${name}. Fetching details...`,
      ).start();
      org = await api.getOrganizationByName(name);
      if (!org) {
        spinner.stop();
        spinner = wait(
          `Organization '${name}' not found. Creating...`,
        ).start();
        org = await api.createOrganization(name);
        spinner.succeed(`Created new organization '${org!.name}'.`);
      } else {
        spinner.stop();
      }
    } catch (e) {
      error(e);
    }
    interruptedSpinner.resume();
    return org;
  },
};
