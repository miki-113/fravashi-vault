# Third-party notices / Сторонние компоненты

FravashiVault itself is licensed under AGPL-3.0-or-later (see [LICENSE](LICENSE)). It bundles or depends on the components below, each under its own license. Versions were taken from the headers of the files in `static/vendor`, from `tailwind.config.js`, from `AUDIT.md` (qrcode-generator) and from `Cargo.lock`. Where no version could be established it says "not recorded" (Inter and JetBrains Mono: the font files and `fonts.css` carry no version, and no package manifest records them).

Сам FravashiVault распространяется по AGPL-3.0 (см. [LICENSE](LICENSE)). Ниже — компоненты, которые входят в проект или от которых он зависит; у каждого своя лицензия.

## Front-end (bundled in `static/`)

| Component | Version | License | Where |
|---|---|---|---|
| [Vue](https://github.com/vuejs/core) | 3.3.4 | MIT | `static/vendor/vue.runtime.global.prod.js` (runtime-only build) |
| [@vue/compiler-dom](https://github.com/vuejs/core) | 3.3.4 (development only, `package.json`; not shipped) | MIT | `tools/compile-templates.mjs` generates `static/app-render.js` from `index.html` |
| [PapaParse](https://github.com/mholt/PapaParse) | 5.4.1 | MIT | `static/vendor/papaparse.min.js` |
| [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) (Kazuhiko Arase, © 2009) | 1.4.4 (as recorded in AUDIT.md; the file header has no version) | MIT | `static/vendor/qrcode.js` |
| [JsBarcode](https://github.com/lindell/JsBarcode) (© Johan Lindell) | 3.11.6 | MIT | `static/vendor/JsBarcode.all.min.js` (loyalty card barcodes) |
| [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss) | 3.4.17 (build time only; the generated CSS is `static/app.css`) | MIT | `static/app.css` |
| [Inter](https://github.com/rsms/inter) | not recorded | SIL OFL 1.1 | `static/vendor/fonts/inter-*.woff2` |
| [JetBrains Mono](https://github.com/JetBrains/JetBrainsMono) | not recorded | SIL OFL 1.1 | `static/vendor/fonts/jetbrains-mono-*.woff2` |
| [Font Awesome Free](https://fontawesome.com/license/free) | 6.4.0 | Icons: CC BY 4.0; fonts: SIL OFL 1.1; code: MIT | `static/vendor/fontawesome/` |

Font files are web-font subsets (latin, cyrillic). The "QR Code" name is a registered trademark of DENSO WAVE INCORPORATED.

Font Awesome Free attribution: icons © Fonticons, Inc., licensed under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). The license text is at https://fontawesome.com/license/free.

## Rust crates

137 crates in the dependency graph of `Cargo.lock` (direct and transitive), generated from `cargo metadata --locked`. The license column is the SPDX expression declared by each crate.

To regenerate or check the list yourself:

```sh
cargo metadata --format-version 1 --locked   # full data, JSON
cargo install cargo-license && cargo license  # readable table
cargo install cargo-about && cargo about      # full license texts
```

| Crate | Version | License |
|---|---|---|
| adler2 | 2.0.1 | 0BSD OR MIT OR Apache-2.0 |
| aead | 0.5.2 | MIT OR Apache-2.0 |
| aes | 0.8.4 | MIT OR Apache-2.0 |
| aes-gcm | 0.10.3 | Apache-2.0 OR MIT |
| ahash | 0.8.12 | MIT OR Apache-2.0 |
| android_system_properties | 0.1.6 | MIT OR Apache-2.0 |
| argon2 | 0.5.3 | MIT OR Apache-2.0 |
| async-trait | 0.1.92 | MIT OR Apache-2.0 |
| atomic-waker | 1.1.2 | Apache-2.0 OR MIT |
| autocfg | 1.5.1 | Apache-2.0 OR MIT |
| axum | 0.7.9 | MIT |
| axum-core | 0.4.5 | MIT |
| base64ct | 1.8.3 | Apache-2.0 OR MIT |
| bitflags | 2.13.2 | MIT OR Apache-2.0 |
| blake2 | 0.10.6 | MIT OR Apache-2.0 |
| block-buffer | 0.10.4 | MIT OR Apache-2.0 |
| bumpalo | 3.20.3 | MIT OR Apache-2.0 |
| bytes | 1.12.1 | MIT |
| cc | 1.9.0 | MIT OR Apache-2.0 |
| cfg-if | 1.0.5 | MIT OR Apache-2.0 |
| chrono | 0.4.45 | MIT OR Apache-2.0 |
| cipher | 0.4.4 | MIT OR Apache-2.0 |
| core-foundation-sys | 0.8.7 | MIT OR Apache-2.0 |
| cpufeatures | 0.2.17 | MIT OR Apache-2.0 |
| crc32fast | 1.5.3 | MIT OR Apache-2.0 |
| crypto-common | 0.1.7 | MIT OR Apache-2.0 |
| ctr | 0.9.2 | MIT OR Apache-2.0 |
| digest | 0.10.7 | MIT OR Apache-2.0 |
| errno | 0.3.14 | MIT OR Apache-2.0 |
| fallible-iterator | 0.3.0 | MIT/Apache-2.0 |
| fallible-streaming-iterator | 0.1.9 | MIT/Apache-2.0 |
| find-msvc-tools | 0.1.15 | MIT OR Apache-2.0 |
| flate2 | 1.1.10 | MIT OR Apache-2.0 |
| form_urlencoded | 1.2.2 | MIT OR Apache-2.0 |
| futures-core | 0.3.34 | MIT OR Apache-2.0 |
| futures-sink | 0.3.34 | MIT OR Apache-2.0 |
| futures-task | 0.3.34 | MIT OR Apache-2.0 |
| futures-util | 0.3.34 | MIT OR Apache-2.0 |
| generic-array | 0.14.7 | MIT |
| getrandom | 0.2.17 | MIT OR Apache-2.0 |
| ghash | 0.5.1 | Apache-2.0 OR MIT |
| hashbrown | 0.14.5 | MIT OR Apache-2.0 |
| hashlink | 0.9.1 | MIT OR Apache-2.0 |
| hex | 0.4.3 | MIT OR Apache-2.0 |
| http | 1.5.0 | MIT OR Apache-2.0 |
| http-body | 1.1.0 | MIT |
| http-body-util | 0.1.5 | MIT |
| http-range-header | 0.4.2 | MIT |
| httparse | 1.10.1 | MIT OR Apache-2.0 |
| httpdate | 1.0.3 | MIT OR Apache-2.0 |
| hyper | 1.12.0 | MIT |
| hyper-util | 0.1.21 | MIT |
| iana-time-zone | 0.1.65 | MIT OR Apache-2.0 |
| iana-time-zone-haiku | 0.1.2 | MIT OR Apache-2.0 |
| inout | 0.1.4 | MIT OR Apache-2.0 |
| itoa | 1.0.18 | MIT OR Apache-2.0 |
| js-sys | 0.3.106 | MIT OR Apache-2.0 |
| libc | 0.2.191 | MIT OR Apache-2.0 |
| libsqlite3-sys | 0.30.1 | MIT |
| lock_api | 0.4.14 | MIT OR Apache-2.0 |
| log | 0.4.34 | MIT OR Apache-2.0 |
| matchit | 0.7.3 | MIT AND BSD-3-Clause |
| memchr | 2.8.3 | Unlicense OR MIT |
| mime | 0.3.17 | MIT OR Apache-2.0 |
| mime_guess | 2.0.5 | MIT |
| miniz_oxide | 0.9.1 | MIT OR Zlib OR Apache-2.0 |
| mio | 1.2.4 | MIT |
| num-traits | 0.2.19 | MIT OR Apache-2.0 |
| once_cell | 1.21.4 | MIT OR Apache-2.0 |
| opaque-debug | 0.3.1 | MIT OR Apache-2.0 |
| parking_lot | 0.12.5 | MIT OR Apache-2.0 |
| parking_lot_core | 0.9.12 | MIT OR Apache-2.0 |
| password-hash | 0.5.0 | MIT OR Apache-2.0 |
| percent-encoding | 2.3.2 | MIT OR Apache-2.0 |
| pin-project-lite | 0.2.17 | Apache-2.0 OR MIT |
| pkg-config | 0.3.34 | MIT OR Apache-2.0 |
| polyval | 0.6.2 | Apache-2.0 OR MIT |
| ppv-lite86 | 0.2.21 | MIT OR Apache-2.0 |
| proc-macro2 | 1.0.107 | MIT OR Apache-2.0 |
| quote | 1.0.47 | MIT OR Apache-2.0 |
| rand | 0.8.8 | MIT OR Apache-2.0 |
| rand_chacha | 0.3.1 | MIT OR Apache-2.0 |
| rand_core | 0.6.4 | MIT OR Apache-2.0 |
| redox_syscall | 0.5.18 | MIT |
| rusqlite | 0.32.1 | MIT |
| rustversion | 1.0.23 | MIT OR Apache-2.0 |
| ryu | 1.0.23 | Apache-2.0 OR BSL-1.0 |
| scopeguard | 1.2.0 | MIT OR Apache-2.0 |
| serde | 1.0.229 | MIT OR Apache-2.0 |
| serde_core | 1.0.229 | MIT OR Apache-2.0 |
| serde_derive | 1.0.229 | MIT OR Apache-2.0 |
| serde_json | 1.0.154 | MIT OR Apache-2.0 |
| serde_path_to_error | 0.1.20 | MIT OR Apache-2.0 |
| serde_urlencoded | 0.7.1 | MIT/Apache-2.0 |
| sha1 | 0.10.7 | MIT OR Apache-2.0 |
| sha2 | 0.10.9 | MIT OR Apache-2.0 |
| shlex | 2.0.1 | MIT OR Apache-2.0 |
| signal-hook-registry | 1.4.8 | MIT OR Apache-2.0 |
| simd-adler32 | 0.3.10 | MIT |
| slab | 0.4.12 | MIT |
| smallvec | 1.16.3 | MIT OR Apache-2.0 |
| socket2 | 0.6.5 | MIT OR Apache-2.0 |
| subtle | 2.6.1 | BSD-3-Clause |
| syn | 2.0.119 | MIT OR Apache-2.0 |
| syn | 3.0.9 | MIT OR Apache-2.0 |
| sync_wrapper | 1.0.2 | Apache-2.0 |
| tokio | 1.54.1 | MIT |
| tokio-macros | 2.7.2 | MIT |
| tokio-util | 0.7.20 | MIT |
| tower | 0.5.3 | MIT |
| tower-http | 0.5.2 | MIT |
| tower-layer | 0.3.3 | MIT |
| tower-service | 0.3.3 | MIT |
| tracing | 0.1.44 | MIT |
| tracing-core | 0.1.36 | MIT |
| typenum | 1.20.1 | MIT OR Apache-2.0 |
| unicase | 2.10.0 | MIT OR Apache-2.0 |
| unicode-ident | 1.0.27 | (MIT OR Apache-2.0) AND Unicode-3.0 |
| universal-hash | 0.5.1 | MIT OR Apache-2.0 |
| vcpkg | 0.2.15 | MIT/Apache-2.0 |
| version_check | 0.9.5 | MIT/Apache-2.0 |
| wasi | 0.11.1+wasi-snapshot-preview1 | Apache-2.0 WITH LLVM-exception OR Apache-2.0 OR MIT |
| wasm-bindgen | 0.2.129 | MIT OR Apache-2.0 |
| wasm-bindgen-macro | 0.2.129 | MIT OR Apache-2.0 |
| wasm-bindgen-macro-support | 0.2.129 | MIT OR Apache-2.0 |
| wasm-bindgen-shared | 0.2.129 | MIT OR Apache-2.0 |
| windows-core | 0.62.2 | MIT OR Apache-2.0 |
| windows-implement | 0.60.2 | MIT OR Apache-2.0 |
| windows-interface | 0.59.3 | MIT OR Apache-2.0 |
| windows-link | 0.2.1 | MIT OR Apache-2.0 |
| windows-result | 0.4.1 | MIT OR Apache-2.0 |
| windows-strings | 0.5.1 | MIT OR Apache-2.0 |
| windows-sys | 0.61.2 | MIT OR Apache-2.0 |
| zerocopy | 0.8.63 | BSD-2-Clause OR Apache-2.0 OR MIT |
| zerocopy-derive | 0.8.63 | BSD-2-Clause OR Apache-2.0 OR MIT |
| zlib-rs | 0.6.8 | Zlib |
| zmij | 1.0.23 | MIT |
