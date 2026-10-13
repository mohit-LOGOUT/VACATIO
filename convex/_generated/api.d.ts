/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as adminAccess from "../adminAccess.js";
import type * as adminRules from "../adminRules.js";
import type * as adminSetup from "../adminSetup.js";
import type * as auth from "../auth.js";
import type * as checkInRules from "../checkInRules.js";
import type * as documentReader from "../documentReader.js";
import type * as hermes from "../hermes.js";
import type * as http from "../http.js";
import type * as listingReader from "../listingReader.js";
import type * as precheck from "../precheck.js";
import type * as precheckRules from "../precheckRules.js";
import type * as precheckWorkflow from "../precheckWorkflow.js";
import type * as propertyFields from "../propertyFields.js";
import type * as propertyImporter from "../propertyImporter.js";
import type * as propertyPhotos from "../propertyPhotos.js";
import type * as propertyWorkflow from "../propertyWorkflow.js";
import type * as reviews from "../reviews.js";
import type * as sandbox from "../sandbox.js";
import type * as sandboxRules from "../sandboxRules.js";
import type * as trainer from "../trainer.js";
import type * as trainerAI from "../trainerAI.js";
import type * as trainerRules from "../trainerRules.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  adminAccess: typeof adminAccess;
  adminRules: typeof adminRules;
  adminSetup: typeof adminSetup;
  auth: typeof auth;
  checkInRules: typeof checkInRules;
  documentReader: typeof documentReader;
  hermes: typeof hermes;
  http: typeof http;
  listingReader: typeof listingReader;
  precheck: typeof precheck;
  precheckRules: typeof precheckRules;
  precheckWorkflow: typeof precheckWorkflow;
  propertyFields: typeof propertyFields;
  propertyImporter: typeof propertyImporter;
  propertyPhotos: typeof propertyPhotos;
  propertyWorkflow: typeof propertyWorkflow;
  reviews: typeof reviews;
  sandbox: typeof sandbox;
  sandboxRules: typeof sandboxRules;
  trainer: typeof trainer;
  trainerAI: typeof trainerAI;
  trainerRules: typeof trainerRules;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  staticHosting: import("@convex-dev/static-hosting/_generated/component.js").ComponentApi<"staticHosting">;
  workflow: import("@convex-dev/workflow/_generated/component.js").ComponentApi<"workflow">;
  agent: import("@convex-dev/agent/_generated/component.js").ComponentApi<"agent">;
};
