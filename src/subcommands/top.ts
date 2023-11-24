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
import { Table, TableUnicodeCharacters } from "https://deno.land/x/tui@2.1.6/src/components/table.ts";

export default async function topSubcommand(args: Args) {
  const regionTableHeight = new Signal(4);
  let regionTableWidth = 0;
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
    });
    tui.dispatch();
    tui.run();
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
    const layout = new Signal([], {
      deepObserve: true,
      watchObjectIndex: true,
    });
    const regions: {
      [region: string]: {
        instances: Signal<{
          [instance: string]: { ts: Date; item: any };
        }>;
      };
    } = {};
    for await (const item of metering_items) {
      if (item.region.includes("fake")) {
        continue;
      }
      lastUpdate = new Date();
      let region = regions[item.region];
      if (region) {
        region.instances.value[item.runner] = {
          ts: lastUpdate,
          item,
        };
      } else {
        region = regions[item.region] = {
          instances: new Signal({
            [item.runner]: {
              ts: lastUpdate,
              item,
            },
          }, { deepObserve: true, watchObjectIndex: true }),
        };
        layout.value.push(item.region);

        console.error("NEW TABLE");
        const regionTable = new Table({
          parent: tui,
          theme: {
            frame: {},
            header: {},
            selectedRow: {},
          },
          zIndex: 0,
          // Hack to workaround bug in Tui
          // (deepObserve in the TableUnicodeCharacters fail with TypeError: Cannot redefine property: Symbol(connected_signal))
          charMap: new Signal(TableUnicodeCharacters.sharp),
        //   charMap: "sharp",
          headers: [
            {
              title: "Requests/min",
            },
            {
              title: "CPU usage",
            },
            {
              title: "CPU time/req",
            },
            {
              title: "RSS/5min",
            },
          ],
          data: new Computed(() => {
            const data = [];
            for (const instance in region.instances.value) {
              const { item } = region.instances.value[instance];
              data.push([
                item.rpm.toFixed(0),
                `${(item.cpuTimePerSecond / 10).toFixed(2)}%`,
                `${(item.cpuTimePerRequest || 0).toFixed(2)}ms`,
                `${(item.maxRssMemory5Minutes / 1_000_000).toFixed(3)}MB`,
              ]);
            }
            return data;
          }),

          rectangle: new Computed(() => {
            // console.error("table width: ", regionTableWidth);
            const numCols = Math.floor(
              mainBox.rectangle.value.width / regionTableWidth,
            );
            const index = layout.value.indexOf(item.region);
            const row = Math.floor(index / numCols);
            const extraRow = row === 0 ? 0 : row;
            const col = index % numCols;
            const extraCol = col === 0 ? 0 : col;
            const remainingWidth = mainBox.rectangle.value.width -
              (numCols * regionTableWidth);
            const gap = remainingWidth / numCols;
            const rowGap = row !== 0 ? row : 0;
            const colGap = col !== 0 ? gap * col : 0;
            return {
              row: mainBox.rectangle.value.row + (row * regionTableHeight.value) +
                extraRow + rowGap + 1,
              column: mainBox.rectangle.value.column + (col * regionTableWidth) +
                extraCol + colGap,
              height: regionTableHeight.value,
              width: regionTableWidth,
            };
          }),
        });
        // console.error("tui --", tui.rectangle.value, "\tmainBox --", mainBox.rectangle.value, "\ttable --", regionTable.rectangle.value);
        regionTableWidth = regionTable.rectangle.value.width;
        const regionTitle = new Label({
          parent: regionTable,
          theme: {},
          zIndex: 0,
          overwriteRectangle: true,
          align: {
            vertical: "center",
            horizontal: "center",
          },
          // rectangle: { row: 2, column: 1, width: isolateBox.rectangle.width },
          rectangle: new Computed(() => ({
            row: regionTable.rectangle.value.row - 1,
            column: regionTable.rectangle.value.column,
            width: regionTable.rectangle.value.width,
            height: 1,
          })),
          text: item.region,
        });
        new Frame({
          parent: regionTable,
          theme: {},
          zIndex: 0,
          rectangle: regionTitle.rectangle,
          charMap: "sharp",
        });

        region.table = regionTable;
      }

      headerText.value = "Updated now!";
      let maxInstances = 0;
      for (const region in regions) {
        if (maxInstances < Object.keys(regions[region].instances.value).length) {
          maxInstances = Object.keys(regions[region].instances.value).length;
        }
        for (const instance in regions[region].instances.value) {
          if (
            new Date() - regions[region].instances.value[instance].ts > 30_000
          ) {
            delete regions[region].instances.value[instance];
          }
        }
        if (Object.keys(regions[region].instances.value).length === 0) {
          layout.value.splice(layout.value.indexOf(region));
          regions[region].table.destroy();
          delete regions[region];
        }
      }
      regionTableHeight.value = maxInstances + 4;
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
