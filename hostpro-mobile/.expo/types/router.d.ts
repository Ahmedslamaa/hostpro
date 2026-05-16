/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(auth)/login` | `/(dashboard)` | `/(dashboard)/` | `/(dashboard)/profile` | `/(dashboard)/reservations` | `/_sitemap` | `/login` | `/profile` | `/reservations`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
