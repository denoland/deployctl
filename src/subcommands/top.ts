// deno-lint-ignore-file no-explicit-any
// Copyright 2021 Deno Land Inc. All rights reserved. MIT license.

import { Args } from "../args.ts";
import { API } from "../utils/api.ts";
import TokenProvisioner from "../utils/access_token.ts";
import { wait } from "../utils/spinner.ts";
import {
  bgBrightGreen,
  Box,
  Computed,
  Frame,
  green,
  Label,
  Signal,
  Text,
  Tui,
} from "../../deps.ts";
import { satisfies } from "https://deno.land/std@0.170.0/semver/mod.ts";
import { LabelRectangle } from "https://deno.land/x/tui@2.1.6/src/components/label.ts";
import * as colors from "https://deno.land/std@0.170.0/fmt/colors.ts";
import { format } from "https://deno.land/std@0.170.0/fmt/duration.ts";
import {
  GridLayout,
  HorizontalLayout,
  VerticalLayout,
} from "https://deno.land/x/tui@2.1.6/mod.ts";
import {
  handleInput,
  handleKeyboardControls,
  handleMouseControls,
} from "https://deno.land/x/tui@2.1.6/mod.ts";

export default async function topSubcommand(args: Args) {
  const isolateBoxHeight = 6;
  const isolateBoxWidth = 32;
  const regions = new Signal([], { deepObserve: true, watchObjectIndex: true });
  let tui;
  try {
    tui = new Tui({ refreshRate: 1000 / 60 });

    handleInput(tui);
    handleMouseControls(tui);
    handleKeyboardControls(tui);
    const headerText = new Signal("Connecting...");
    const header = new Box({
      parent: tui,
      rectangle: {
        column: 0,
        row: 0,
        width: tui.rectangle.value.width,
        height: 1,
      },
      zIndex: 0,
      theme: { base: colors.bgGreen },
    });
    new Text({
      parent: header,
      text: headerText,
      theme: { base: (text) => colors.bgGreen(colors.black(text)) },
      zIndex: 1,
      rectangle: { column: 1, row: 0 },
    });
    const mainBox = new Box({
      parent: tui,
      theme: {},
      zIndex: 0,
      rectangle: new Computed(() => ({
        row: 2,
        column: 1,
        width: tui.rectangle.value.width - 2,
        height: tui.rectangle.value.height - 3,
      })),
      // rectangle: new Computed(() => {
      //   const numCols = Math.floor(
      //     tui.rectangle.value.width / isolateBoxWidth,
      //   );
      //   const width = numCols * isolateBoxWidth;
      //   const height = Math.ceil(regions.value.length / numCols) *
      //     isolateBoxHeight;
      //   return {
      //     row: 1,
      //     column: 0,
      //     width,
      //     height,
      //   };
      // }),
    });
    //   const numItems = new Signal(0);
    //   const mainLayout = new GridLayout({
    //     rectangle: mainBox.rectangle,
    //     // gapX: 1,
    //     // gapY: 1,
    //     pattern: new Computed(() => {
    //       let grid = [];
    //       let row = [];
    //       const minRows = Math.floor(
    //         mainBox.rectangle.value.height / isolateBoxHeight,
    //       );
    //       const numCols = Math.floor(
    //         mainBox.rectangle.value.width / isolateBoxWidth,
    //       );

    //       for (const regionId of regions.value) {
    //         row.push(regionId);
    //         if (row.length === numCols) {
    //           grid.push(row);
    //           row = [];
    //         }
    //       }
    //       if (row) {
    //         for (let x = row.length; x < numCols; x++) {
    //           row.push(crypto.randomUUID());
    //         }
    //         grid.push(row);
    //       }
    //       for (let x = grid.length; x < minRows; x++) {
    //         grid.push(new Array(numCols).fill("empty"));
    //       }
    //       return grid;
    //     }),
    //   });
    //   new Frame({
    //     parent: tui,
    //     rectangle: mainBox.rectangle,
    //     zIndex: 0,
    //     theme: {},
    //     charMap: "sharp",
    //   });
    tui.dispatch();
    tui.run();
    //   spinner = wait("Gathering data...").start();
    let lastUpdate;
    setInterval(() => {
      if (lastUpdate) {
        const secs = ((new Date() - lastUpdate) / 1000).toFixed(0);
        if (secs > 2) {
          headerText.value = `Last updated ${secs}s ago`;
        }
      }
    }, 500);
    const api = API.withTokenProvisioner(TokenProvisioner);
    const spinner = wait(`fetching metering of ${args.project}`).start();
    const metering_items = api.stream_metering(args.project!);
    spinner.succeed(`Metering of ${args.project} ready`);
    const items: { [region: string]: { ts: Date; item: Signal<any> } } = {};
    for await (const item of metering_items) {
      let x = items[item.runner];
      if (x) {
        x.ts = new Date();
        x.item.value = item;
      } else {
        x = items[item.runner] = {
          ts: new Date(),
          item: new Signal(item),
        };

        const regionId = crypto.randomUUID().toString();
        regions.value.push(regionId);
        x.regionId = regionId;

        const isolateBox = new Box({
          parent: tui,
          theme: {},
          zIndex: 0,
          // rectangle: mainLayout.element(regionId),
          rectangle: new Computed(() => {
            const numCols = Math.floor(
              mainBox.rectangle.value.width / isolateBoxWidth,
            );
            const index = regions.value.indexOf(regionId);
            const row = Math.floor(index / numCols);
            const extraRow = row === 0 ? 0 : row;
            const col = index % numCols;
            const extraCol = col === 0 ? 0 : col;
            const remainingWidth = mainBox.rectangle.value.width -
              (numCols * isolateBoxWidth);
            const gap = remainingWidth / numCols;
            const rowGap = row !== 0 ? row : 0;
            const colGap = col !== 0 ? gap * col : 0;
            return {
              row: mainBox.rectangle.value.row + (row * isolateBoxHeight) +
                extraRow + rowGap,
              column: mainBox.rectangle.value.column + (col * isolateBoxWidth) +
                extraCol + colGap,
              height: isolateBoxHeight,
              width: isolateBoxWidth,
            };
          }),
          // rectangle: { row: 2, column: 1, width: 32, height: 6 },
        });
        new Frame({
          parent: tui,
          theme: {},
          zIndex: 0,
          rectangle: isolateBox.rectangle,
          charMap: "sharp",
        });
        const isolateBoxLayout = new VerticalLayout({
          rectangle: isolateBox.rectangle,
          pattern: ["title", "frame", "rpm", "cpuUsage", "cpuRequest", "rss"],
          // gapY: 1,
          // gapX: 1,
        });
        const regionTitle = new Text({
          parent: isolateBox,
          theme: {},
          zIndex: 0,
          // rectangle: { row: 2, column: 1, width: isolateBox.rectangle.width },
          rectangle: isolateBoxLayout.element("title"),
          text: x.item.value.region,
        });
        new Frame({
          parent: isolateBox,
          theme: {},
          zIndex: 0,
          rectangle: regionTitle.rectangle,
          charMap: "sharp",
        });
        const rpmLayout = new HorizontalLayout({
          rectangle: isolateBoxLayout.element("rpm"),
          pattern: ["value", "value", "label", "label", "label", "label"],
          gapX: 1,
        });
        new Label({
          parent: isolateBox,
          theme: {},
          zIndex: 0,
          overwriteRectangle: true,
          rectangle: rpmLayout.element("value"),
          align: { vertical: "center", horizontal: "right" },
          text: new Computed(() => x.item.value.rpm.toFixed(0)),
        });
        new Label({
          parent: isolateBox,
          theme: {},
          zIndex: 0,
          rectangle: rpmLayout.element("label"),
          align: { vertical: "center", horizontal: "left" },
          text: "Requests/s",
        });
        const cpuUsageLayout = new HorizontalLayout({
          rectangle: isolateBoxLayout.element("cpuUsage"),
          pattern: ["value", "value", "label", "label", "label", "label"],
          gapX: 1,
        });
        new Label({
          parent: isolateBox,
          theme: {},
          zIndex: 0,
          overwriteRectangle: true,
          rectangle: cpuUsageLayout.element("value"),
          align: { vertical: "center", horizontal: "right" },
          text: new Computed(() =>
            `${(x.item.value.cpuTimePerSecond / 10).toFixed(2)}%`
          ),
        });
        new Label({
          parent: isolateBox,
          theme: {},
          zIndex: 0,
          rectangle: cpuUsageLayout.element("label"),
          align: { vertical: "center", horizontal: "left" },
          text: "CPU usage/isolate",
        });
        const cpuRequestLayout = new HorizontalLayout({
          rectangle: isolateBoxLayout.element("cpuRequest"),
          pattern: ["value", "value", "label", "label", "label", "label"],
          gapX: 1,
        });
        new Label({
          parent: isolateBox,
          theme: {},
          zIndex: 0,
          overwriteRectangle: true,
          rectangle: cpuRequestLayout.element("value"),
          align: { vertical: "center", horizontal: "right" },
          text: new Computed(() =>
            `${(x.item.value.cpuTimePerRequest || 0).toFixed(2)}ms`
          ),
        });
        new Label({
          parent: isolateBox,
          theme: {},
          zIndex: 0,
          rectangle: cpuRequestLayout.element("label"),
          align: { vertical: "center", horizontal: "left" },
          text: "CPU time/request",
        });
        const rssLayout = new HorizontalLayout({
          rectangle: isolateBoxLayout.element("rss"),
          pattern: ["value", "value", "label", "label", "label", "label"],
          gapX: 1,
        });
        new Label({
          parent: isolateBox,
          theme: {},
          zIndex: 0,
          overwriteRectangle: true,
          rectangle: rssLayout.element("value"),
          align: { vertical: "center", horizontal: "right" },
          text: new Computed(() =>
            `${(x.item.value.maxRssMemory5Minutes / 1_000_000).toFixed(3)}MB`
          ),
        });
        new Label({
          parent: isolateBox,
          theme: {},
          zIndex: 0,
          rectangle: rssLayout.element("label"),
          align: { vertical: "center", horizontal: "left" },
          text: "MAX RSS/5min",
        });
        //   new Label({
        //     parent: isolateBox,
        //     theme: {},
        //     zIndex: 0,
        //     rectangle: { row: 4, column: 1 },
        //     text: new Computed(() =>
        //       `${x.item.value.rpm.toFixed(0)} RPM\n${
        //         (x.item.value.cpuTimePerSecond / 10).toFixed(2)
        //       }% CPU usage/isolate\n${
        //         (x.item.value.cpuTimePerRequest || 0).toFixed(2)
        //       }ms CPU time/request\n${
        //         (x.item.value.maxRssMemory5Minutes / 1_000_000).toFixed(3)
        //       }MB MAX RSS/5min`
        //     ),
        //     align: {
        //       horizontal: "left",
        //       vertical: "top",
        //     },
        //   });
        x.box = isolateBox;
      }

      lastUpdate = x.ts;
      headerText.value = "Updated now!";
      // items[item.runner] = {
      //   ts: new Date(),
      //   item: new Signal(item),
      // };
      for (const runner of Object.keys(items)) {
        if (new Date() - items[runner].ts > 30_000) {
          regions.value.splice(
            regions.value.indexOf(items[runner].regionId),
            1,
          );
          items[runner].box.destroy();
          delete items[runner];
        }
      }
      // for (const item of items) {
      // spinner.stop();
      // spinner = wait(
      //   "Updating...\n" +
      //     Object.values(items).map((item) =>
      //       `${item.item.region} / ${item.item.runner}\n\t${
      //         item.item.rpm.toFixed(0)
      //       } RPM\n\t${
      //         (item.item.cpuTimePerSecond / 10).toFixed(2)
      //       }% CPU usage/isolate\n\t${
      //         item.item.cpuTimePerRequest.toFixed(2)
      //       }ms CPU time/request\n\t${
      //         (item.item.maxRssMemory5Minutes / 1_000_000).toFixed(3)
      //       }MB MAX RSS/5min`
      //     ).join("\n---\n"),
      // ).start();
    }
  } finally {
    if (tui) {
      tui.destroy();
    }
  }
}

// TODO: table with all the isolates of a region as rows, meters as columns
// TODO: fix render panics when font size is small

// - RPS
// - CPU
// - memory
// - network

