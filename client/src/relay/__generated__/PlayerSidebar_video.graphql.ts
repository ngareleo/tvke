/**
 * @generated SignedSource<<070d23da5b172c7b14c696cd18e27bcd>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type PlayerSidebar_video$data = {
  readonly durationSeconds: number;
  readonly title: string;
  readonly videoStream: {
    readonly height: number;
  } | null | undefined;
  readonly " $fragmentType": "PlayerSidebar_video";
};
export type PlayerSidebar_video$key = {
  readonly " $data"?: PlayerSidebar_video$data;
  readonly " $fragmentSpreads": FragmentRefs<"PlayerSidebar_video">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "PlayerSidebar_video",
  "selections": [
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

(node as any).hash = "e4337239a23ec53f823ed7fab3be377f";

export default node;
