/**
 * @generated SignedSource<<680c9a249d02196c6ab51f6a62d96939>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type Resolution = "RESOLUTION_1080P" | "RESOLUTION_240P" | "RESOLUTION_360P" | "RESOLUTION_480P" | "RESOLUTION_4K" | "RESOLUTION_720P" | "%future added value";
export type VideoPlayerStartTranscodeMutation$variables = {
  resolution: Resolution;
  videoId: string;
};
export type VideoPlayerStartTranscodeMutation$data = {
  readonly startTranscode: {
    readonly id: string;
  };
};
export type VideoPlayerStartTranscodeMutation = {
  response: VideoPlayerStartTranscodeMutation$data;
  variables: VideoPlayerStartTranscodeMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "resolution"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "videoId"
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "resolution",
        "variableName": "resolution"
      },
      {
        "kind": "Variable",
        "name": "videoId",
        "variableName": "videoId"
      }
    ],
    "concreteType": "TranscodeJob",
    "kind": "LinkedField",
    "name": "startTranscode",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "VideoPlayerStartTranscodeMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "VideoPlayerStartTranscodeMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "a69abc910e82757df4eec1a45c12b927",
    "id": null,
    "metadata": {},
    "name": "VideoPlayerStartTranscodeMutation",
    "operationKind": "mutation",
    "text": "mutation VideoPlayerStartTranscodeMutation(\n  $videoId: ID!\n  $resolution: Resolution!\n) {\n  startTranscode(videoId: $videoId, resolution: $resolution) {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "cb963e8537f423f3f2acac980875cf4a";

export default node;
