/**
 * @generated SignedSource<<364665b601a328b8d9404bd37dbc4a61>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type JobStatus = "COMPLETE" | "ERROR" | "PENDING" | "RUNNING" | "%future added value";
export type Resolution = "RESOLUTION_1080P" | "RESOLUTION_240P" | "RESOLUTION_360P" | "RESOLUTION_480P" | "RESOLUTION_4K" | "RESOLUTION_720P" | "%future added value";
export type useVideoPlaybackStartTranscodeMutation$variables = {
  resolution: Resolution;
  videoId: string;
};
export type useVideoPlaybackStartTranscodeMutation$data = {
  readonly startTranscode: {
    readonly completedSegments: number;
    readonly id: string;
    readonly status: JobStatus;
    readonly totalSegments: number | null | undefined;
  };
};
export type useVideoPlaybackStartTranscodeMutation = {
  response: useVideoPlaybackStartTranscodeMutation$data;
  variables: useVideoPlaybackStartTranscodeMutation$variables;
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
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "status",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "completedSegments",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "totalSegments",
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
    "name": "useVideoPlaybackStartTranscodeMutation",
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
    "name": "useVideoPlaybackStartTranscodeMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "b38f60433ffa97c285bcda716a1c3d78",
    "id": null,
    "metadata": {},
    "name": "useVideoPlaybackStartTranscodeMutation",
    "operationKind": "mutation",
    "text": "mutation useVideoPlaybackStartTranscodeMutation(\n  $videoId: ID!\n  $resolution: Resolution!\n) {\n  startTranscode(videoId: $videoId, resolution: $resolution) {\n    id\n    status\n    completedSegments\n    totalSegments\n  }\n}\n"
  }
};
})();

(node as any).hash = "534fe93738e5a109fa90bcc3f9aa1b80";

export default node;
