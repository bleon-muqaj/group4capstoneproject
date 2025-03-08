/* tslint:disable */
/* eslint-disable */
/**
*/
export function start(): void;
/**
* @param {string} name
*/
export function greet(name: string): void;
/**
* @param {string} source
* @returns {AssemblerResult}
*/
export function assemble_mips32(source: string): AssemblerResult;
/**
* @param {Uint8Array} bytes
* @returns {Uint32Array}
*/
export function bytes_to_words(bytes: Uint8Array): Uint32Array;
/**
*/
export class AssemblerResult {
  free(): void;
/**
* @returns {boolean}
*/
  failed(): boolean;
/**
* @returns {string}
*/
  error(): string;
/**
* @returns {Uint8Array}
*/
  text(): Uint8Array;
/**
* @returns {Uint8Array}
*/
  data(): Uint8Array;
}
/**
*/
export class Mips32Core {
  free(): void;
/**
*/
  constructor();
/**
* @param {Uint8Array} text
*/
  load_text(text: Uint8Array): void;
/**
* @param {Uint8Array} data
*/
  load_data(data: Uint8Array): void;
/**
* @returns {Uint32Array}
*/
  dump_registers(): Uint32Array;
/**
* Returns true if any data between $sp and the stack top changes
* @returns {boolean}
*/
  stack_changed(): boolean;
/**
* @returns {Uint8Array}
*/
  dump_stack(): Uint8Array;
/**
* Returns true if any data between the data section and $sp has changed
* @returns {boolean}
*/
  heap_changed(): boolean;
/**
* @returns {Uint8Array}
*/
  dump_heap(): Uint8Array;
/**
* Returns true if any data in the static data section has changed
* @returns {boolean}
*/
  static_changed(): boolean;
/**
* @returns {Uint8Array}
*/
  dump_static(): Uint8Array;
/**
* @returns {boolean}
*/
  tick(): boolean;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly start: () => void;
  readonly greet: (a: number, b: number) => void;
  readonly __wbg_assemblerresult_free: (a: number, b: number) => void;
  readonly assemblerresult_failed: (a: number) => number;
  readonly assemblerresult_error: (a: number, b: number) => void;
  readonly assemblerresult_text: (a: number, b: number) => void;
  readonly assemblerresult_data: (a: number, b: number) => void;
  readonly assemble_mips32: (a: number, b: number) => number;
  readonly __wbg_mips32core_free: (a: number, b: number) => void;
  readonly mips32core_new: () => number;
  readonly mips32core_load_text: (a: number, b: number, c: number) => void;
  readonly mips32core_load_data: (a: number, b: number, c: number) => void;
  readonly mips32core_dump_registers: (a: number, b: number) => void;
  readonly mips32core_heap_changed: (a: number) => number;
  readonly mips32core_dump_heap: (a: number, b: number) => void;
  readonly mips32core_tick: (a: number) => number;
  readonly bytes_to_words: (a: number, b: number, c: number) => void;
  readonly mips32core_stack_changed: (a: number) => number;
  readonly mips32core_dump_stack: (a: number, b: number) => void;
  readonly mips32core_static_changed: (a: number) => number;
  readonly mips32core_dump_static: (a: number, b: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
