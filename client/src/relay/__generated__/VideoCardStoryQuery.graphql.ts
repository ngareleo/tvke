/**
 * @generated SignedSource<<e15f4f443335afd95f374df864097f88>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type VideoCardStoryQuery$variables = {
  videoId: string;
};
export type VideoCardStoryQuery$data = {
  readonly video: {
    readonly " $fragmentSpreads": FragmentRefs<"VideoCard_video">;
  } | null | undefined;
};
export type VideoCardStoryQuery = {
  response: VideoCardStoryQuery$data;
  variables: VideoCardStoryQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "videoId"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "videoId"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "VideoCardStoryQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Video",
        "kind": "LinkedField",
        "name": "video",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "VideoCard_video"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "VideoCardStoryQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Video",
        "kind": "LinkedField",
        "name": "video",
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
            "name": "title",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "durationSeconds",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "VideoStreamInfo",
            "kind": "LinkedField",
            "name": "videoStream",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "height",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "a4cd8ff3fa1100217107a19abd3530c2",
    "id": null,
    "metadata": {},
    "name": "VideoCardStoryQuery",
    "operationKind": "query",
    "text": "query VideoCardStoryQuery(\n  $videoId: ID!\n) {\n  video(id: $videoId) {\n    ...VideoCard_video\n    id\n  }\n}\n\nfragment VideoCard_video on Video {\n  id\n  title\n  durationSeconds\n  videoStream {\n    height\n  }\n}\n"
  }
};
})();

(node as any).hash = "f7417b951a0286be8d21e0d7c5286700";

export default node;
