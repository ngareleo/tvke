/**
 * @generated SignedSource<<3cd82dc6a82959fdccbfeb018dabae0c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type LibraryPageScanMutation$variables = Record<PropertyKey, never>;
export type LibraryPageScanMutation$data = {
  readonly scanLibraries: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
  }>;
};
export type LibraryPageScanMutation = {
  response: LibraryPageScanMutation$data;
  variables: LibraryPageScanMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "Library",
    "kind": "LinkedField",
    "name": "scanLibraries",
    "plural": true,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "name",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "LibraryPageScanMutation",
    "selections": (v0/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "LibraryPageScanMutation",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "f0e569299793e9f64f0bec52764bb814",
    "id": null,
    "metadata": {},
    "name": "LibraryPageScanMutation",
    "operationKind": "mutation",
    "text": "mutation LibraryPageScanMutation {\n  scanLibraries {\n    id\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "8342fa70a8b7dfb3c21bd12bc041d155";

export default node;
