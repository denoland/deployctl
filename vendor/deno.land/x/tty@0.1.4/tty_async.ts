import { encode } from "./util.ts";

import {
  AsyncStream,
  CLEAR_DOWN,
  CLEAR_LEFT,
  CLEAR_LINE,
  CLEAR_RIGHT,
  CLEAR_SCREEN,
  CLEAR_UP,
  DOWN,
  ESC,
  HIDE,
  HOME,
  LEFT,
  NEXT_LINE,
  POSITION,
  PREV_LINE,
  RESTORE,
  RIGHT,
  SCROLL_DOWN,
  SCROLL_UP,
  SHOW,
  UP,
} from "./mod.ts";

export async function write(str: string, writer: AsyncStream): Promise<void> {
  await writer.write(encode(str));
}

export async function restore(
  writer: AsyncStream = Deno.stdout,
): Promise<void> {
  await write(RESTORE, writer);
}

export async function cursor(
  action: string,
  writer: AsyncStream = Deno.stdout,
): Promise<void> {
  await write(ESC + action, writer);
}

export async function position(
  writer: AsyncStream = Deno.stdout,
): Promise<void> {
  await cursor(POSITION, writer);
}

export async function hideCursor(
  writer: AsyncStream = Deno.stdout,
): Promise<void> {
  await cursor(HIDE, writer);
}

export async function showCursor(
  writer: AsyncStream = Deno.stdout,
): Promise<void> {
  await cursor(SHOW, writer);
}

export async function scrollUp(
  writer: AsyncStream = Deno.stdout,
): Promise<void> {
  await cursor(SCROLL_UP, writer);
}

export async function scrollDown(
  writer: AsyncStream = Deno.stdout,
): Promise<void> {
  await cursor(SCROLL_DOWN, writer);
}

export async function clearUp(
  writer: AsyncStream = Deno.stdout,
): Promise<void> {
  await cursor(CLEAR_UP, writer);
}

export async function clearDown(
  writer: AsyncStream = Deno.stdout,
): Promise<void> {
  await cursor(CLEAR_DOWN, writer);
}

export async function clearLeft(
  writer: AsyncStream = Deno.stdout,
): Promise<void> {
  await cursor(CLEAR_LEFT, writer);
}

export async function clearRight(
  writer: AsyncStream = Deno.stdout,
): Promise<void> {
  await cursor(CLEAR_RIGHT, writer);
}

export async function clearLine(
  writer: AsyncStream = Deno.stdout,
): Promise<void> {
  await cursor(CLEAR_LINE, writer);
}

export async function clearScreen(
  writer: AsyncStream = Deno.stdout,
): Promise<void> {
  await cursor(CLEAR_SCREEN, writer);
}

export async function nextLine(
  writer: AsyncStream = Deno.stdout,
): Promise<void> {
  await cursor(NEXT_LINE, writer);
}

export async function prevLine(
  writer: AsyncStream = Deno.stdout,
): Promise<void> {
  await cursor(PREV_LINE, writer);
}

export async function goHome(writer: AsyncStream = Deno.stdout): Promise<void> {
  await cursor(HOME, writer);
}

export async function goUp(
  y = 1,
  writer: AsyncStream = Deno.stdout,
): Promise<void> {
  await cursor(y + UP, writer);
}

export async function goDown(
  y = 1,
  writer: AsyncStream = Deno.stdout,
): Promise<void> {
  await cursor(y + DOWN, writer);
}

export async function goLeft(
  x = 1,
  writer: AsyncStream = Deno.stdout,
): Promise<void> {
  await cursor(x + LEFT, writer);
}

export async function goRight(
  x = 1,
  writer: AsyncStream = Deno.stdout,
): Promise<void> {
  await cursor(x + RIGHT, writer);
}

export async function goTo(
  x: number,
  y: number,
  writer: AsyncStream = Deno.stdout,
): Promise<void> {
  await write(ESC + y + ";" + x + HOME, writer);
}
