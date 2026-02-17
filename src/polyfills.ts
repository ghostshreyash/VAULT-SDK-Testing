import { Buffer } from 'buffer';
// @ts-ignore
import process from 'process';

if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
  window.process = process;
}
