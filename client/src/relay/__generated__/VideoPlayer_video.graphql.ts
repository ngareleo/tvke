/**
 * @generated SignedSource<<e04348644aa1910434e0729001e89907>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type VideoPlayer_video$data = {
  readonly durationSeconds: number;
  readonly id: string;
  readonly title: string;
  readonly videoStream: {
    readonly height: number;
  } | null | undefined;
  readonly " $fragmentType": "VideoPlayer_video";
};
export type VideoPlayer_video$key = {
  readonly " $data"?: VideoPlayer_video$data;
  readonly " $fragmentSpreads": FragmentRefs<"VideoPlayer_video">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "VideoPlayer_video",
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
  "type": "Video",
  "abstractKey": null
};

(node as any).hash = "5ae1a7dfd60a039f1a1efe3cafc7794d";

export default node;
