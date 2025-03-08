/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export function start(): void;
export function greet(a: number, b: number): void;
export function __wbg_assemblerresult_free(a: number, b: number): void;
export function assemblerresult_failed(a: number): number;
export function assemblerresult_error(a: number, b: number): void;
export function assemblerresult_text(a: number, b: number): void;
export function assemblerresult_data(a: number, b: number): void;
export function assemble_mips32(a: number, b: number): number;
export function __wbg_mips32core_free(a: number, b: number): void;
export function mips32core_new(): number;
export function mips32core_load_text(a: number, b: number, c: number): void;
export function mips32core_load_data(a: number, b: number, c: number): void;
export function mips32core_dump_registers(a: number, b: number): void;
export function mips32core_heap_changed(a: number): number;
export function mips32core_dump_heap(a: number, b: number): void;
export function mips32core_tick(a: number): number;
export function bytes_to_words(a: number, b: number, c: number): void;
export function mips32core_stack_changed(a: number): number;
export function mips32core_dump_stack(a: number, b: number): void;
export function mips32core_static_changed(a: number): number;
export function mips32core_dump_static(a: number, b: number): void;
export function __wbindgen_malloc(a: number, b: number): number;
export function __wbindgen_realloc(a: number, b: number, c: number, d: number): number;
export function __wbindgen_add_to_stack_pointer(a: number): number;
export function __wbindgen_free(a: number, b: number, c: number): void;
export function __wbindgen_start(): void;
