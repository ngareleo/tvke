/**
 * @generated SignedSource<<63548553840a3ccc93acf3c23e6efaff>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type PlayerPageQuery$variables = {
  id: string;
};
export type PlayerPageQuery$data = {
  readonly video: {
    readonly durationSeconds: number;
    readonly id: string;
    readonly title: string;
    readonly videoStream: {
      readonly height: number;
    } | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"VideoPlayer_video">;
  } | null | undefined;
};
export type PlayerPageQuery = {
  response: PlayerPageQuery$data;
  variables: PlayerPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "durationSeconds",
  "storageKey": null
},
v5 = {
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "PlayerPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Video",
        "kind": "LinkedField",
        "name": "video",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/),
          (v5/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "VideoPlayer_video"
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
    "name": "PlayerPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Video",
        "kind": "LinkedField",
        "name": "video",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/),
          (v5/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "2fa4cf1dead94ad08ccd49f449697e47",
    "id": null,
    "metadata": {},
    "name": "PlayerPageQuery",
    "operationKind": "query",
    "text": "query PlayerPageQuery(\n  $id: ID!\n) {\n  video(id: $id) {\n    id\n    title\n    durationSeconds\n    videoStream {\n      height\n    }\n    ...VideoPlayer_video\n  }\n}\n\nfragment ControlBar_video on Video {\n  title\n  durationSeconds\n  videoStream {\n    height\n  }\n}\n\nfragment VideoPlayer_video on Video {\n  id\n  videoStream {\n    height\n  }\n  ...ControlBar_video\n}\n"
  }
};
})();

(node as any).hash = "5e49efa7743c12ff392b9a85a8a56b85";

export default node;
