/**
 * @generated SignedSource<<fcab1de85f4040ce7c7087965b5adf50>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type LibraryGridStoryQuery$variables = {
  libraryId: string;
};
export type LibraryGridStoryQuery$data = {
  readonly node: {
    readonly " $fragmentSpreads": FragmentRefs<"LibraryGrid_library">;
  } | null | undefined;
};
export type LibraryGridStoryQuery = {
  response: LibraryGridStoryQuery$data;
  variables: LibraryGridStoryQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "libraryId"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "libraryId"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "LibraryGridStoryQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "LibraryGrid_library"
              }
            ],
            "type": "Library",
            "abstractKey": null
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
    "name": "LibraryGridStoryQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": [
                  {
                    "kind": "Literal",
                    "name": "first",
                    "value": 50
                  }
                ],
                "concreteType": "VideoConnection",
                "kind": "LinkedField",
                "name": "videos",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "VideoEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Video",
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          (v2/*: any*/),
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
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "videos(first:50)"
              }
            ],
            "type": "Library",
            "abstractKey": null
          },
          (v2/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "59acc61e55d5198ee16dbb18c48cacdb",
    "id": null,
    "metadata": {},
    "name": "LibraryGridStoryQuery",
    "operationKind": "query",
    "text": "query LibraryGridStoryQuery(\n  $libraryId: ID!\n) {\n  node(id: $libraryId) {\n    __typename\n    ... on Library {\n      ...LibraryGrid_library\n    }\n    id\n  }\n}\n\nfragment LibraryGrid_library on Library {\n  videos(first: 50) {\n    edges {\n      node {\n        id\n        ...VideoCard_video\n      }\n    }\n  }\n}\n\nfragment VideoCard_video on Video {\n  id\n  title\n  durationSeconds\n  videoStream {\n    height\n  }\n}\n"
  }
};
})();

(node as any).hash = "75005cb4f6e8b64ee3f647ee375f2737";

export default node;
