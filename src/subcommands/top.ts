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
import {
  Table,
  TableUnicodeCharacters,
} from "https://deno.land/x/tui@2.1.6/src/components/table.ts";

export default async function topSubcommand(args: Args) {
  const regionTableHeight = new Signal(5);
  const usesKv = new Signal(false);
  const usesQueues = new Signal(false);
  let regionTableWidth = new Signal(0);
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
        kvHeadersReady: Signal<boolean>;
        queuesHeadersReady: Signal<boolean>;
        instances: Signal<{
          [instance: string]: { ts: Date; item: any };
        }>;
      };
    } = {};
    for await (const item of metering_items) {
      lastUpdate = new Date();
      let region = regions[item.region];
      if (region) {
        region.instances.value[item.runner] = {
          ts: lastUpdate,
          item,
        };
      } else {
        region = regions[item.region] = {
          kvHeadersReady: new Signal(usesKv.peek()),
          queuesHeadersReady: new Signal(usesQueues.peek()),
          kvRectangleReady: new Signal(usesKv.peek()),
          queuesRectangleReady: new Signal(usesQueues.peek()),
          instances: new Signal({
            [item.runner]: {
              ts: lastUpdate,
              item,
            },
          }, { deepObserve: true, watchObjectIndex: true }),
        };
        layout.value.push(item.region);

        const regionTable = new Table({
          parent: tui,
          theme: {
            frame: {},
            header: {},
            selectedRow: { base: (text) => colors.bgBlue(colors.black(text)) },
          },
          zIndex: 0,
          // Hack to workaround bug in Tui
          // (deepObserve in the TableUnicodeCharacters fail with TypeError: Cannot redefine property: Symbol(connected_signal))
          charMap: new Signal(TableUnicodeCharacters.sharp),
          //   charMap: "sharp",
          headers: new Computed(() => {
            const headers = [
              {
                title: "Req/min".padStart(7, " "),
              },
              {
                title: "CPU%".padStart(7, " "),
              },
              {
                title: "CPU/req".padStart(8, " "),
              },
              {
                title: "RSS/5min".padStart(9, " "),
              },
            ];
            if (region.kvRectangleReady.value && (usesKv.value || region.kvHeadersReady.value)) {
              headers.push(
                {
                  title: "KVr/min".padStart(7, " "),
                },
              );
              headers.push({
                title: "KVw/min".padStart(7, " "),
              });
              region.kvHeadersReady.value = true;
            } else {
                region.queuesHeadersReady.value = false;
            }
            if (region.queuesRectangleReady.value && (usesQueues.value || region.queuesHeadersReady.value)) {
              headers.push(
                {
                  title: "enqueue/min".padStart(11, " "),
                },
              );
              headers.push({
                title: "dequeue/min".padStart(11, " "),
              });
              region.queuesHeadersReady.value = true;
            } else {
                region.queuesHeadersReady.value = false;
            }
            return headers;
          }),

          data: new Computed(() => {
            const data = [];
            for (const instance in region.instances.value) {
              const { item } = region.instances.value[instance];
              const row = [
                item.rpm.toFixed(0).padStart(7, " "),
                `${(item.cpuTimePerSecond / 10).toFixed(2)}%`.padStart(7, " "),
                `${(item.cpuTimePerRequest || 0).toFixed(2)}ms`.padStart(
                  8,
                  " ",
                ),
                `${(item.maxRssMemory5Minutes / 1_000_000).toFixed(3)}MB`
                  .padStart(9, " "),
              ];
              if (usesKv.value && region.kvHeadersReady.value) {
                row.push(item.kvReadUnitsPerMinute.toFixed(0).padStart(7, " "));
                row.push(
                  item.kvWriteUnitsPerMinute.toFixed(0).padStart(7, " "),
                );
              } else {
                region.kvHeadersReady.value = false;
              }
              if (usesQueues.value && region.queuesHeadersReady.value) {
                row.push(
                  item.queueEnqueuePerMinute.toFixed(0).padStart(11, " "),
                );
                row.push(
                  item.queueDequeuePerMinute.toFixed(0).padStart(11, " "),
                );
              } else {
                region.queuesHeadersReady.value = false;
              }
              data.push(row);
            }
            return data;
          }),

          rectangle: new Computed(() => {
            const numCols = Math.floor(
              mainBox.rectangle.value.width / regionTableWidth.value,
            );
            const index = layout.value.indexOf(item.region);
            const row = Math.floor(index / numCols);
            const extraRow = row === 0 ? 0 : row;
            const col = index % numCols;
            const extraCol = col === 0 ? 0 : col;
            const remainingWidth = Math.floor(
              mainBox.rectangle.value.width -
                (numCols * regionTableWidth.value),
            ) - 1;
            const gap = Math.floor(remainingWidth / numCols);
            const rowGap = row !== 0 ? row : 0;
            const colGap = col !== 0 ? gap * col : 0;
            return {
              row: Math.ceil(
                mainBox.rectangle.value.row +
                  (row * regionTableHeight.value) +
                  extraRow + rowGap + 1,
              ),
              column: Math.ceil(
                mainBox.rectangle.value.column +
                  (col * regionTableWidth.value) +
                  extraCol + colGap,
              ),
              height: regionTableHeight.value,
              width: regionTableWidth.value,
            };
          }),
        });
        new Effect(() => regionTableWidth.value = regionTable.rectangle.value.width);
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
            column: regionTable.rectangle.value.column + 1,
            width: regionTable.rectangle.value.width - 2,
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
      let kv = false;
      let queues = false;
      for (const region in regions) {
        if (
          maxInstances < Object.keys(regions[region].instances.value).length
        ) {
          maxInstances = Object.keys(regions[region].instances.value).length;
        }
        for (const instance in regions[region].instances.value) {
          const i = regions[region].instances.value[instance];
          if (new Date() - i.ts > 30_000) {
            delete regions[region].instances.value[instance];
          } else {
            if (
              i.item.kvReadUnitsPerMinute !== 0 ||
              i.item.kvWriteUnitsPerMinute !== 0
            ) {
              kv = true;
            }
            if (
              i.item.queueEnqueuePerMinute !== 0 ||
              i.item.queueDequeuePerMinute !== 0
            ) {
              queues = true;
            }
          }
        }
        if (Object.keys(regions[region].instances.value).length === 0) {
          layout.value.splice(layout.value.indexOf(region));
          regions[region].table.destroy();
          delete regions[region];
        }
      }
      regionTableHeight.value = Math.min(maxInstances, 5) + 4;
      usesKv.value = kv;
      usesQueues.value = queues;
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
