export {};
declare global {
  /** Fix this type, preferably before accepting the PR */
  type $FixMe = unknown;

  /** This `any` is intentional and never has to be fixed */
  type $IntentionalAny = any;

  /** Typescript cannot express the proper type currently */
  type $Unexpressable = any;

  /** Remove readonly from all properties */
  type $Writeable<T> = { -readonly [P in keyof T]: T[P] };
}
