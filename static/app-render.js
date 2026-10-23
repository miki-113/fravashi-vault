// Сгенерировано tools/compile-templates.mjs из index.html (корень #app). Не править вручную:
// после изменения разметки выполнить npm run build:templates.
// template-sha256: fd0658ec24f7670ef1531f0a2ae554f56a5886d6fea307aa603ee68cbec8384a
window.FravashiRender = (function () {
const { createElementVNode: _createElementVNode, toDisplayString: _toDisplayString, openBlock: _openBlock, createElementBlock: _createElementBlock, createCommentVNode: _createCommentVNode, createTextVNode: _createTextVNode, renderList: _renderList, Fragment: _Fragment, normalizeClass: _normalizeClass, vModelText: _vModelText, withKeys: _withKeys, withDirectives: _withDirectives, withModifiers: _withModifiers, vModelDynamic: _vModelDynamic, vModelCheckbox: _vModelCheckbox, vShow: _vShow, normalizeStyle: _normalizeStyle, vModelSelect: _vModelSelect } = Vue

const _hoisted_1 = {
  key: 0,
  class: "flex h-full w-full items-center justify-center"
}
const _hoisted_2 = { class: "text-center" }
const _hoisted_3 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-circle-notch fa-spin text-2xl text-[#315bd7] mb-3" }, null, -1 /* HOISTED */)
const _hoisted_4 = { class: "text-xs font-semibold text-[#7281a4]" }
const _hoisted_5 = {
  key: 1,
  class: "flex h-[100dvh] w-full overflow-hidden"
}
const _hoisted_6 = { class: "hidden lg:flex w-[50%] flex-col justify-between auth-art-bg p-11 text-white relative overflow-hidden" }
const _hoisted_7 = { class: "flex items-center gap-3 relative z-10" }
const _hoisted_8 = /*#__PURE__*/_createElementVNode("img", {
  src: "/static/icons/icon.svg",
  alt: "FravashiVault",
  class: "h-10 w-10 rounded-xl shadow-sm"
}, null, -1 /* HOISTED */)
const _hoisted_9 = /*#__PURE__*/_createElementVNode("div", { class: "text-[18px] font-semibold tracking-[-0.04em] text-white" }, "FravashiVault", -1 /* HOISTED */)
const _hoisted_10 = { class: "text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b9c9ee]" }
const _hoisted_11 = { class: "mt-1 text-[10px] text-[#b9c9ee] opacity-80" }
const _hoisted_12 = { class: "my-auto mx-auto text-center max-w-md relative z-10" }
const _hoisted_13 = {
  class: "mx-auto",
  style: {"position":"relative","width":"235px","height":"235px"}
}
const _hoisted_14 = {
  width: "235",
  height: "235",
  viewBox: "0 0 512 512",
  fill: "none",
  style: {"position":"absolute","inset":"0"}
}
const _hoisted_15 = /*#__PURE__*/_createElementVNode("g", { class: "ring-cw" }, [
  /*#__PURE__*/_createElementVNode("circle", {
    cx: "256",
    cy: "256",
    r: "230",
    stroke: "#496fe8",
    "stroke-width": "2.5",
    "stroke-dasharray": "14 10",
    "stroke-opacity": "0.7"
  })
], -1 /* HOISTED */)
const _hoisted_16 = /*#__PURE__*/_createElementVNode("g", { class: "ring-ccw" }, [
  /*#__PURE__*/_createElementVNode("circle", {
    cx: "256",
    cy: "256",
    r: "192",
    stroke: "#f4c96b",
    "stroke-width": "1.8",
    "stroke-dasharray": "28 18",
    "stroke-opacity": "0.55"
  })
], -1 /* HOISTED */)
const _hoisted_17 = [
  _hoisted_15,
  _hoisted_16
]
const _hoisted_18 = /*#__PURE__*/_createElementVNode("div", { style: {"position":"absolute","inset":"0","display":"flex","align-items":"center","justify-content":"center"} }, [
  /*#__PURE__*/_createElementVNode("img", {
    src: "/static/icons/icon.svg",
    alt: "FravashiVault",
    class: "shield-levitate",
    style: {"width":"150px","height":"150px","border-radius":"28px"}
  })
], -1 /* HOISTED */)
const _hoisted_19 = /*#__PURE__*/_createElementVNode("div", { class: "inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold text-[#f4c96b] mt-3 mb-2" }, [
  /*#__PURE__*/_createElementVNode("span", { class: "h-2 w-2 rounded-full bg-[#7ee0ae]" }),
  /*#__PURE__*/_createTextVNode(" Zero-Knowledge • Rust / Axum ")
], -1 /* HOISTED */)
const _hoisted_20 = { class: "font-serif text-3xl leading-tight tracking-[-0.03em] text-white" }
const _hoisted_21 = ["innerHTML"]
const _hoisted_22 = { class: "rounded-xl border border-[#556b99]/70 bg-[#29416c]/80 p-3.5 relative z-10 flex items-center justify-between" }
const _hoisted_23 = { class: "flex items-center gap-2.5" }
const _hoisted_24 = /*#__PURE__*/_createElementVNode("div", { class: "grid h-8 w-8 place-items-center rounded-full bg-[#a4e1ca] text-[#1e594a]" }, [
  /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-lock text-xs" })
], -1 /* HOISTED */)
const _hoisted_25 = { class: "text-xs font-semibold text-white" }
const _hoisted_26 = { class: "text-[10px] text-[#d0dbf2]" }
const _hoisted_27 = /*#__PURE__*/_createElementVNode("span", { class: "text-[10px] font-mono text-[#a8edcf]" }, "Self-hosted", -1 /* HOISTED */)
const _hoisted_28 = { class: "flex flex-1 flex-col items-center justify-center p-5 overflow-y-auto relative safe-top-header" }
const _hoisted_29 = {
  class: "absolute right-5 flex items-center gap-2",
  style: {"top":"max(16px, env(safe-area-inset-top))"}
}
const _hoisted_30 = ["aria-label"]
const _hoisted_31 = ["onClick", "aria-pressed", "title"]
const _hoisted_32 = ["title", "aria-label"]
const _hoisted_33 = { class: "flex items-center gap-3 mb-4 lg:hidden" }
const _hoisted_34 = /*#__PURE__*/_createElementVNode("img", {
  src: "/static/icons/icon.svg",
  alt: "FravashiVault",
  class: "h-9 w-9 rounded-xl shadow-sm"
}, null, -1 /* HOISTED */)
const _hoisted_35 = /*#__PURE__*/_createElementVNode("div", { class: "text-base font-bold" }, "FravashiVault", -1 /* HOISTED */)
const _hoisted_36 = { class: "text-[10px] opacity-70" }
const _hoisted_37 = { class: "font-serif text-[24px] sm:text-[26px] tracking-[-0.03em]" }
const _hoisted_38 = {
  key: 0,
  class: "space-y-3.5"
}
const _hoisted_39 = { class: "text-[11px]" }
const _hoisted_40 = { class: "block text-[11px] font-semibold" }
const _hoisted_41 = ["inputmode", "placeholder", "maxlength"]
const _hoisted_42 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-shield-halved text-xs" }, null, -1 /* HOISTED */)
const _hoisted_43 = { class: "flex justify-between pt-2 text-[11px]" }
const _hoisted_44 = {
  key: 1,
  class: "space-y-3.5"
}
const _hoisted_45 = { class: "block text-[11px] font-semibold" }
const _hoisted_46 = { class: "block text-[11px] font-semibold" }
const _hoisted_47 = { class: "relative mt-1.5" }
const _hoisted_48 = ["type"]
const _hoisted_49 = ["aria-label"]
const _hoisted_50 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-unlock text-xs" }, null, -1 /* HOISTED */)
const _hoisted_51 = { class: "flex justify-between pt-2 text-[11px]" }
const _hoisted_52 = {
  key: 2,
  class: "space-y-3"
}
const _hoisted_53 = { class: "block text-[11px] font-semibold" }
const _hoisted_54 = { class: "block text-[11px] font-semibold" }
const _hoisted_55 = { class: "block text-[11px] font-semibold" }
const _hoisted_56 = {
  key: 0,
  class: "block text-[11px] font-semibold"
}
const _hoisted_57 = { class: "mt-1 block font-normal text-[#7281a4]" }
const _hoisted_58 = { class: "block text-[11px] font-semibold" }
const _hoisted_59 = { class: "flex items-center gap-2 text-[11px] cursor-pointer pt-1" }
const _hoisted_60 = { class: "text-center pt-1 text-[11px]" }
const _hoisted_61 = {
  key: 3,
  class: "space-y-3"
}
const _hoisted_62 = { class: "block text-[11px] font-semibold" }
const _hoisted_63 = { class: "block text-[11px] font-semibold" }
const _hoisted_64 = { class: "block text-[11px] font-semibold" }
const _hoisted_65 = { class: "text-center pt-1 text-[11px]" }
const _hoisted_66 = {
  key: 2,
  class: "flex h-[100dvh] w-full overflow-hidden relative"
}
const _hoisted_67 = { class: "flex items-center gap-3" }
const _hoisted_68 = /*#__PURE__*/_createElementVNode("img", {
  src: "/static/icons/icon.svg",
  alt: "FravashiVault",
  class: "h-9 w-9 rounded-xl shadow-sm"
}, null, -1 /* HOISTED */)
const _hoisted_69 = /*#__PURE__*/_createElementVNode("div", { class: "text-[16px] font-semibold tracking-[-0.04em] text-white" }, "FravashiVault", -1 /* HOISTED */)
const _hoisted_70 = { class: "mt-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#b9c9ee]" }
const _hoisted_71 = ["aria-label", "title"]
const _hoisted_72 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-xmark" }, null, -1 /* HOISTED */)
const _hoisted_73 = [
  _hoisted_72
]
const _hoisted_74 = { class: "px-3 pt-4" }
const _hoisted_75 = { class: "mb-2 px-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#93a8d7]" }
const _hoisted_76 = /*#__PURE__*/_createElementVNode("span", { class: "grid h-6 w-6 place-items-center rounded-md bg-[#f5c968] text-[#293c68]" }, [
  /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-key text-[11px]" })
], -1 /* HOISTED */)
const _hoisted_77 = { class: "flex-1 truncate" }
const _hoisted_78 = { class: "text-[10px] tabular-nums text-[#c6d3f2]" }
const _hoisted_79 = /*#__PURE__*/_createElementVNode("span", { class: "grid h-6 w-6 place-items-center rounded-md bg-[#f3a7c4] text-[#642744]" }, [
  /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-star text-[11px]" })
], -1 /* HOISTED */)
const _hoisted_80 = { class: "flex-1 truncate" }
const _hoisted_81 = { class: "text-[10px] tabular-nums text-[#c6d3f2]" }
const _hoisted_82 = { class: "grid grid-cols-2 gap-1 mt-1.5" }
const _hoisted_83 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-lock text-[10px]" }, null, -1 /* HOISTED */)
const _hoisted_84 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-users text-[10px]" }, null, -1 /* HOISTED */)
const _hoisted_85 = { class: "px-3 pt-4" }
const _hoisted_86 = { class: "text-[9px] font-semibold uppercase tracking-[0.18em] text-[#93a8d7]" }
const _hoisted_87 = { class: "flex items-center gap-1" }
const _hoisted_88 = ["title", "aria-label"]
const _hoisted_89 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-wand-magic-sparkles text-[10px]" }, null, -1 /* HOISTED */)
const _hoisted_90 = [
  _hoisted_89
]
const _hoisted_91 = ["title", "aria-label"]
const _hoisted_92 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-plus text-[11px]" }, null, -1 /* HOISTED */)
const _hoisted_93 = [
  _hoisted_92
]
const _hoisted_94 = ["onClick"]
const _hoisted_95 = { class: "flex-1 truncate" }
const _hoisted_96 = { class: "text-[10px] tabular-nums text-[#c6d3f2]" }
const _hoisted_97 = { class: "px-3 pt-4" }
const _hoisted_98 = { class: "text-[9px] font-semibold uppercase tracking-[0.18em] text-[#93a8d7]" }
const _hoisted_99 = { class: "space-y-0.5" }
const _hoisted_100 = /*#__PURE__*/_createElementVNode("span", { class: "grid h-6 w-6 place-items-center rounded-md bg-[#c5a9ff] text-[#4c347a]" }, [
  /*#__PURE__*/_createElementVNode("i", { class: "fa-regular fa-credit-card text-[11px]" })
], -1 /* HOISTED */)
const _hoisted_101 = { class: "flex-1 truncate" }
const _hoisted_102 = { class: "text-[10px] text-[#c6d3f2]" }
const _hoisted_103 = /*#__PURE__*/_createElementVNode("span", { class: "grid h-6 w-6 place-items-center rounded-md bg-[#ffb8d9] text-[#7a2a52]" }, [
  /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-barcode text-[11px]" })
], -1 /* HOISTED */)
const _hoisted_104 = { class: "flex-1 truncate" }
const _hoisted_105 = { class: "text-[10px] text-[#c6d3f2]" }
const _hoisted_106 = /*#__PURE__*/_createElementVNode("span", { class: "grid h-6 w-6 place-items-center rounded-md bg-[#ffd875] text-[#67511a]" }, [
  /*#__PURE__*/_createElementVNode("i", { class: "fa-regular fa-note-sticky text-[11px]" })
], -1 /* HOISTED */)
const _hoisted_107 = { class: "flex-1 truncate" }
const _hoisted_108 = { class: "text-[10px] text-[#c6d3f2]" }
const _hoisted_109 = /*#__PURE__*/_createElementVNode("span", { class: "grid h-6 w-6 place-items-center rounded-md bg-[#8adbc4] text-[#205945]" }, [
  /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-wifi text-[10px]" })
], -1 /* HOISTED */)
const _hoisted_110 = { class: "flex-1 truncate" }
const _hoisted_111 = { class: "text-[10px] text-[#c6d3f2]" }
const _hoisted_112 = /*#__PURE__*/_createElementVNode("span", { class: "grid h-6 w-6 place-items-center rounded-md bg-[#91d2ff] text-[#214b7c]" }, [
  /*#__PURE__*/_createElementVNode("i", { class: "fa-regular fa-clock text-[11px]" })
], -1 /* HOISTED */)
const _hoisted_113 = { class: "flex-1 truncate" }
const _hoisted_114 = { class: "text-[10px] text-[#c6d3f2]" }
const _hoisted_115 = /*#__PURE__*/_createElementVNode("span", { class: "grid h-6 w-6 place-items-center rounded-md bg-[#ffb5a6] text-[#763b39]" }, [
  /*#__PURE__*/_createElementVNode("i", { class: "fa-regular fa-clone text-[11px]" })
], -1 /* HOISTED */)
const _hoisted_116 = { class: "flex-1 truncate" }
const _hoisted_117 = {
  key: 0,
  class: "rounded-full bg-[#f4c96b] px-1.5 py-0.5 text-[9px] font-bold text-[#20325d]"
}
const _hoisted_118 = /*#__PURE__*/_createElementVNode("span", { class: "grid h-6 w-6 place-items-center rounded-md bg-[#a4e1ca] text-[#1e594a]" }, [
  /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-shield-cat text-[11px]" })
], -1 /* HOISTED */)
const _hoisted_119 = { class: "flex-1 truncate" }
const _hoisted_120 = { class: "text-[10px] text-[#a8edcf]" }
const _hoisted_121 = /*#__PURE__*/_createElementVNode("span", { class: "grid h-6 w-6 place-items-center rounded-md bg-[#b3c8ff] text-[#2c437e]" }, [
  /*#__PURE__*/_createElementVNode("i", { class: "fa-regular fa-trash-can text-[11px]" })
], -1 /* HOISTED */)
const _hoisted_122 = { class: "flex-1 truncate" }
const _hoisted_123 = { class: "text-[10px] text-[#c6d3f2]" }
const _hoisted_124 = { class: "mt-auto p-3.5 pb-6" }
const _hoisted_125 = { class: "mb-1.5 flex items-center gap-2" }
const _hoisted_126 = /*#__PURE__*/_createElementVNode("div", { class: "grid h-6 w-6 place-items-center rounded-full bg-[#a4e1ca] text-[#1e594a]" }, [
  /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-lock text-[11px]" })
], -1 /* HOISTED */)
const _hoisted_127 = { class: "text-[10.5px] font-semibold text-white truncate" }
const _hoisted_128 = { class: "flex items-center justify-between gap-2" }
const _hoisted_129 = { class: "text-[9.5px] leading-[1.45] text-[#d0dbf2]" }
const _hoisted_130 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-sliders text-xs" }, null, -1 /* HOISTED */)
const _hoisted_131 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-chevron-right ml-auto text-[10px]" }, null, -1 /* HOISTED */)
const _hoisted_132 = { class: "flex min-w-0 flex-1 flex-col h-[100dvh] overflow-hidden" }
const _hoisted_133 = { class: "flex min-w-0 flex-1 items-center gap-2.5" }
const _hoisted_134 = ["title", "aria-label"]
const _hoisted_135 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-bars text-sm" }, null, -1 /* HOISTED */)
const _hoisted_136 = [
  _hoisted_135
]
const _hoisted_137 = { class: "relative flex-1 max-w-[400px]" }
const _hoisted_138 = ["placeholder", "aria-label"]
const _hoisted_139 = ["aria-label"]
const _hoisted_140 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-xmark" }, null, -1 /* HOISTED */)
const _hoisted_141 = [
  _hoisted_140
]
const _hoisted_142 = { class: "flex items-center gap-1.5 sm:gap-2 shrink-0" }
const _hoisted_143 = ["title"]
const _hoisted_144 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-plane-up text-[10px]" }, null, -1 /* HOISTED */)
const _hoisted_145 = ["title"]
const _hoisted_146 = /*#__PURE__*/_createElementVNode("i", { class: "fa-regular fa-clock text-[10px]" }, null, -1 /* HOISTED */)
const _hoisted_147 = ["title", "aria-label"]
const _hoisted_148 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-rotate text-xs" }, null, -1 /* HOISTED */)
const _hoisted_149 = [
  _hoisted_148
]
const _hoisted_150 = ["title", "aria-label"]
const _hoisted_151 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-plus text-xs" }, null, -1 /* HOISTED */)
const _hoisted_152 = ["title", "aria-label"]
const _hoisted_153 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-power-off text-xs" }, null, -1 /* HOISTED */)
const _hoisted_154 = [
  _hoisted_153
]
const _hoisted_155 = { class: "px-4 pb-2 pt-2.5 sm:px-8 sm:pt-4 shrink-0" }
const _hoisted_156 = { class: "flex items-center justify-between gap-2" }
const _hoisted_157 = { class: "min-w-0" }
const _hoisted_158 = { class: "flex items-center gap-1.5 text-[10px] text-[#8493b5]" }
const _hoisted_159 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-chevron-right text-[8px]" }, null, -1 /* HOISTED */)
const _hoisted_160 = { class: "font-semibold text-[#315bd7] dark:text-[#91d2ff] truncate" }
const _hoisted_161 = { class: "font-serif text-[20px] sm:text-[28px] leading-tight tracking-[-0.03em] text-[#1b2a4b] dark:text-[#edf1ff] truncate" }
const _hoisted_162 = {
  key: 0,
  class: "flex items-center gap-1.5 shrink-0"
}
const _hoisted_163 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-layer-group text-[10px]" }, null, -1 /* HOISTED */)
const _hoisted_164 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-arrow-down-up text-[10px]" }, null, -1 /* HOISTED */)
const _hoisted_165 = { key: 1 }
const _hoisted_166 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-arrow-left text-[10px]" }, null, -1 /* HOISTED */)
const _hoisted_167 = {
  key: 0,
  class: "mobile-content-pad grid min-h-0 flex-1 grid-cols-1 gap-4 px-3.5 pb-3 sm:px-8 sm:pb-5 xl:grid-cols-[minmax(300px,375px)_minmax(440px,1fr)] overflow-hidden"
}
const _hoisted_168 = { class: "text-[11px] font-semibold" }
const _hoisted_169 = {
  key: 0,
  class: "border-b border-[#315bd7]/30 bg-[#315bd7]/10 px-3 py-2 flex items-center justify-between gap-2"
}
const _hoisted_170 = { class: "text-[11px] font-semibold text-[#315bd7] dark:text-[#91d2ff]" }
const _hoisted_171 = {
  key: 0,
  class: "flex gap-1.5"
}
const _hoisted_172 = { class: "min-h-0 flex-1 overflow-y-auto p-1.5 sm:p-2" }
const _hoisted_173 = ["onClick"]
const _hoisted_174 = ["checked", "onClick"]
const _hoisted_175 = {
  key: 0,
  class: "fa-regular fa-note-sticky"
}
const _hoisted_176 = {
  key: 1,
  class: "fa-regular fa-credit-card"
}
const _hoisted_177 = {
  key: 2,
  class: "fa-solid fa-barcode"
}
const _hoisted_178 = {
  key: 3,
  class: "fa-solid fa-wifi text-xs"
}
const _hoisted_179 = ["src", "onLoad", "onError"]
const _hoisted_180 = { class: "min-w-0 flex-1" }
const _hoisted_181 = { class: "flex items-center gap-1.5" }
const _hoisted_182 = {
  key: 0,
  class: "fa-solid fa-star shrink-0 text-[10px] text-[#c49b4a]"
}
const _hoisted_183 = {
  key: 1,
  class: "shrink-0 rounded bg-[#315bd7]/15 px-1.5 py-0.2 text-[9px] font-bold text-[#315bd7] dark:text-[#91d2ff]"
}
const _hoisted_184 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-chevron-right text-[10px] text-[#8093c2]/60" }, null, -1 /* HOISTED */)
const _hoisted_185 = {
  key: 1,
  class: "flex h-full min-h-[220px] flex-col items-center justify-center px-6 text-center"
}
const _hoisted_186 = { class: "text-[12px] font-semibold" }
const _hoisted_187 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-arrow-left" }, null, -1 /* HOISTED */)
const _hoisted_188 = { class: "flex items-center gap-1.5" }
const _hoisted_189 = ["title", "aria-label"]
const _hoisted_190 = ["title", "aria-label"]
const _hoisted_191 = /*#__PURE__*/_createElementVNode("i", { class: "fa-regular fa-trash-can text-xs" }, null, -1 /* HOISTED */)
const _hoisted_192 = [
  _hoisted_191
]
const _hoisted_193 = { class: "flex items-center gap-3 min-w-0 flex-1" }
const _hoisted_194 = {
  key: 0,
  class: "fa-regular fa-note-sticky"
}
const _hoisted_195 = {
  key: 1,
  class: "fa-regular fa-credit-card"
}
const _hoisted_196 = {
  key: 2,
  class: "fa-solid fa-barcode"
}
const _hoisted_197 = {
  key: 3,
  class: "fa-solid fa-wifi"
}
const _hoisted_198 = ["src"]
const _hoisted_199 = { class: "min-w-0 flex-1" }
const _hoisted_200 = { class: "flex items-center gap-2 flex-wrap" }
const _hoisted_201 = { class: "text-[15px] sm:text-[16px] font-bold tracking-[-0.02em] break-all" }
const _hoisted_202 = ["value"]
const _hoisted_203 = { value: "" }
const _hoisted_204 = ["value"]
const _hoisted_205 = { class: "hidden xl:flex items-center gap-1.5" }
const _hoisted_206 = ["title", "aria-label"]
const _hoisted_207 = ["title", "aria-label"]
const _hoisted_208 = /*#__PURE__*/_createElementVNode("i", { class: "fa-regular fa-trash-can text-xs" }, null, -1 /* HOISTED */)
const _hoisted_209 = [
  _hoisted_208
]
const _hoisted_210 = { class: "px-4 py-4 sm:px-7 space-y-4" }
const _hoisted_211 = {
  key: 0,
  class: "space-y-2"
}
const _hoisted_212 = { class: "flex items-center justify-between gap-2 flex-wrap" }
const _hoisted_213 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-table-cells-large text-[10px] mr-1" }, null, -1 /* HOISTED */)
const _hoisted_214 = ["onClick"]
const _hoisted_215 = /*#__PURE__*/_createElementVNode("div", { class: "absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" }, null, -1 /* HOISTED */)
const _hoisted_216 = /*#__PURE__*/_createElementVNode("div", { class: "absolute -right-4 top-16 h-32 w-32 rounded-full bg-white/[0.06]" }, null, -1 /* HOISTED */)
const _hoisted_217 = { class: "relative flex items-start justify-between gap-2" }
const _hoisted_218 = { class: "min-w-0 truncate pr-2 text-[12px] font-semibold opacity-90" }
const _hoisted_219 = { class: "shrink-0 text-[13px] font-extrabold italic tracking-wide" }
const _hoisted_220 = /*#__PURE__*/_createElementVNode("div", { class: "relative mt-5 flex items-center gap-3" }, [
  /*#__PURE__*/_createElementVNode("div", { class: "h-8 w-11 rounded-md bg-gradient-to-br from-[#f4c96b] to-[#c49b4a]" }),
  /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-wifi rotate-90 text-sm opacity-70" })
], -1 /* HOISTED */)
const _hoisted_221 = ["title"]
const _hoisted_222 = { class: "relative mt-4 flex items-end justify-between gap-3" }
const _hoisted_223 = { class: "min-w-0" }
const _hoisted_224 = { class: "text-[8.5px] uppercase tracking-wider opacity-60" }
const _hoisted_225 = { class: "truncate text-[12px] font-semibold uppercase" }
const _hoisted_226 = { class: "text-[8.5px] uppercase tracking-wider opacity-60" }
const _hoisted_227 = { class: "font-mono text-[12px] font-semibold" }
const _hoisted_228 = ["title"]
const _hoisted_229 = /*#__PURE__*/_createElementVNode("div", { class: "text-[8.5px] uppercase tracking-wider opacity-60" }, "CVV", -1 /* HOISTED */)
const _hoisted_230 = { class: "font-mono text-[12px] font-semibold" }
const _hoisted_231 = {
  key: 1,
  class: "mx-auto w-full max-w-[380px] space-y-3"
}
const _hoisted_232 = ["src", "alt"]
const _hoisted_233 = { class: "absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-black/65 px-4 py-2.5" }
const _hoisted_234 = { class: "min-w-0 break-words text-[16px] font-bold leading-tight line-clamp-2" }
const _hoisted_235 = {
  key: 0,
  class: "shrink-0 text-right font-mono text-[11px] font-semibold opacity-90"
}
const _hoisted_236 = /*#__PURE__*/_createElementVNode("div", { class: "absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" }, null, -1 /* HOISTED */)
const _hoisted_237 = /*#__PURE__*/_createElementVNode("div", { class: "absolute -right-4 top-16 h-32 w-32 rounded-full bg-white/[0.06]" }, null, -1 /* HOISTED */)
const _hoisted_238 = { class: "relative flex h-full flex-col justify-between p-5" }
const _hoisted_239 = { class: "flex items-start justify-between gap-3" }
const _hoisted_240 = { class: "min-w-0 break-words text-[22px] font-bold leading-tight tracking-[-0.01em] line-clamp-3" }
const _hoisted_241 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-barcode mt-1 shrink-0 text-[18px] opacity-70" }, null, -1 /* HOISTED */)
const _hoisted_242 = { class: "flex items-end justify-between gap-3" }
const _hoisted_243 = ["title"]
const _hoisted_244 = {
  key: 0,
  class: "shrink-0 text-right"
}
const _hoisted_245 = { class: "text-[8.5px] uppercase tracking-wider opacity-70" }
const _hoisted_246 = { class: "font-mono text-[12px] font-semibold" }
const _hoisted_247 = { class: "flex flex-wrap items-center justify-between gap-2" }
const _hoisted_248 = { class: "flex gap-2" }
const _hoisted_249 = /*#__PURE__*/_createElementVNode("i", { class: "fa-regular fa-copy text-[10px]" }, null, -1 /* HOISTED */)
const _hoisted_250 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-expand text-[10px]" }, null, -1 /* HOISTED */)
const _hoisted_251 = {
  key: 0,
  class: "rounded-xl bg-white p-3 text-center text-black ring-1 ring-black/10"
}
const _hoisted_252 = ["innerHTML"]
const _hoisted_253 = { class: "mt-1 break-all font-mono text-[15px] font-semibold tracking-[0.16em]" }
const _hoisted_254 = {
  key: 1,
  class: "flex items-start gap-2 rounded-lg border border-dashed border-[#f59e0b] p-3 text-[12px] text-[#b45309] dark:text-[#fbbf24]"
}
const _hoisted_255 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-triangle-exclamation mt-0.5" }, null, -1 /* HOISTED */)
const _hoisted_256 = {
  key: 0,
  class: "mt-1 break-all font-mono text-[13px] font-semibold"
}
const _hoisted_257 = {
  key: 2,
  class: "flex items-center justify-between gap-2 flex-wrap"
}
const _hoisted_258 = { class: "flex gap-2" }
const _hoisted_259 = /*#__PURE__*/_createElementVNode("i", { class: "fa-regular fa-copy text-[10px]" }, null, -1 /* HOISTED */)
const _hoisted_260 = { class: "mb-1 flex items-center justify-between" }
const _hoisted_261 = /*#__PURE__*/_createElementVNode("i", { class: "fa-regular fa-copy" }, null, -1 /* HOISTED */)
const _hoisted_262 = { class: "break-all text-[13.5px] font-medium" }
const _hoisted_263 = { class: "mb-1 flex items-center justify-between gap-2 flex-wrap" }
const _hoisted_264 = { class: "flex items-center gap-3" }
const _hoisted_265 = ["title"]
const _hoisted_266 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-shield-virus" }, null, -1 /* HOISTED */)
const _hoisted_267 = /*#__PURE__*/_createElementVNode("i", { class: "fa-regular fa-copy" }, null, -1 /* HOISTED */)
const _hoisted_268 = { class: "break-all font-mono text-[13.5px] tracking-wider" }
const _hoisted_269 = { class: "text-[9.5px] font-semibold uppercase text-[#315bd7] dark:text-[#91d2ff]" }
const _hoisted_270 = { class: "font-mono text-lg font-bold tracking-widest" }
const _hoisted_271 = { class: "rounded-full bg-[#315bd7]/15 px-2.5 py-1 font-mono text-xs font-bold text-[#315bd7] dark:text-[#91d2ff]" }
const _hoisted_272 = ["innerHTML"]
const _hoisted_273 = { class: "text-xs font-bold" }
const _hoisted_274 = { class: "text-[11px] opacity-75 mt-1" }
const _hoisted_275 = { class: "min-w-0" }
const _hoisted_276 = { class: "text-[9.5px] font-semibold uppercase opacity-70" }
const _hoisted_277 = { class: "break-all font-mono text-xs font-semibold tracking-wider" }
const _hoisted_278 = { class: "flex shrink-0 items-center gap-3" }
const _hoisted_279 = ["onClick"]
const _hoisted_280 = ["onClick"]
const _hoisted_281 = /*#__PURE__*/_createElementVNode("i", { class: "fa-regular fa-copy" }, null, -1 /* HOISTED */)
const _hoisted_282 = ["onClick"]
const _hoisted_283 = { class: "text-[9.5px] font-semibold uppercase opacity-70" }
const _hoisted_284 = { class: "text-xs font-semibold" }
const _hoisted_285 = /*#__PURE__*/_createElementVNode("i", { class: "fa-regular fa-copy text-xs opacity-60" }, null, -1 /* HOISTED */)
const _hoisted_286 = { class: "mb-1 text-[9.5px] font-semibold uppercase opacity-70" }
const _hoisted_287 = { class: "grid gap-3 sm:grid-cols-2" }
const _hoisted_288 = { class: "mb-1.5 flex items-center gap-2" }
const _hoisted_289 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-globe text-xs text-[#4f70d5]" }, null, -1 /* HOISTED */)
const _hoisted_290 = { class: "text-[9.5px] font-semibold uppercase opacity-75" }
const _hoisted_291 = { class: "flex items-center justify-between gap-2" }
const _hoisted_292 = ["href"]
const _hoisted_293 = {
  key: 1,
  class: "text-xs opacity-60"
}
const _hoisted_294 = {
  key: 2,
  class: "flex gap-1 shrink-0"
}
const _hoisted_295 = ["href"]
const _hoisted_296 = ["href"]
const _hoisted_297 = { class: "mb-1.5 flex items-center gap-2" }
const _hoisted_298 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-shield-halved text-xs text-[#379776]" }, null, -1 /* HOISTED */)
const _hoisted_299 = { class: "text-[9.5px] font-semibold uppercase opacity-75" }
const _hoisted_300 = { class: "flex items-center justify-between gap-2" }
const _hoisted_301 = /*#__PURE__*/_createElementVNode("span", { class: "text-[12px] font-medium" }, "AES-256-GCM", -1 /* HOISTED */)
const _hoisted_302 = { class: "rounded-full bg-[#bce8ce] px-2 py-0.5 text-[9px] font-bold text-[#286748] dark:bg-[#315b4a] dark:text-[#b6efd2]" }
const _hoisted_303 = {
  key: 2,
  class: "space-y-2.5"
}
const _hoisted_304 = { class: "flex items-center justify-between gap-2" }
const _hoisted_305 = { class: "min-w-0 truncate text-xs font-bold" }
const _hoisted_306 = { class: "font-normal opacity-60" }
const _hoisted_307 = ["href"]
const _hoisted_308 = ["onClick"]
const _hoisted_309 = { class: "min-w-0" }
const _hoisted_310 = { class: "text-[9.5px] font-semibold uppercase opacity-70" }
const _hoisted_311 = { class: "break-all text-[12.5px] font-medium" }
const _hoisted_312 = /*#__PURE__*/_createElementVNode("i", { class: "fa-regular fa-copy text-xs opacity-60" }, null, -1 /* HOISTED */)
const _hoisted_313 = { class: "flex items-center justify-between gap-2" }
const _hoisted_314 = { class: "text-[9.5px] font-semibold uppercase opacity-70" }
const _hoisted_315 = { class: "flex items-center gap-3" }
const _hoisted_316 = ["onClick"]
const _hoisted_317 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-shield-virus" }, null, -1 /* HOISTED */)
const _hoisted_318 = ["onClick"]
const _hoisted_319 = ["onClick"]
const _hoisted_320 = /*#__PURE__*/_createElementVNode("i", { class: "fa-regular fa-copy" }, null, -1 /* HOISTED */)
const _hoisted_321 = { class: "break-all font-mono text-[12.5px] tracking-wider" }
const _hoisted_322 = {
  key: 0,
  class: "whitespace-pre-wrap text-[12px] opacity-80"
}
const _hoisted_323 = { class: "font-semibold opacity-75 mb-1.5" }
const _hoisted_324 = { class: "min-w-0 break-all" }
const _hoisted_325 = { class: "shrink-0 font-sans text-[10px] opacity-60" }
const _hoisted_326 = ["onClick"]
const _hoisted_327 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-shield-halved text-xl" }, null, -1 /* HOISTED */)
const _hoisted_328 = [
  _hoisted_327
]
const _hoisted_329 = { class: "font-serif text-xl" }
const _hoisted_330 = { class: "mt-2 max-w-xs text-[11.5px] leading-relaxed text-[#7787a9] dark:text-[#a4b3d1]" }
const _hoisted_331 = {
  key: 1,
  class: "mobile-content-pad flex-1 overflow-y-auto px-3.5 pb-8 sm:px-8"
}
const _hoisted_332 = {
  key: 0,
  class: "space-y-4 max-w-5xl"
}
const _hoisted_333 = { class: "flex flex-wrap items-center justify-between gap-2" }
const _hoisted_334 = { class: "flex gap-2" }
const _hoisted_335 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-circle-check text-2xl text-[#329371] mb-2" }, null, -1 /* HOISTED */)
const _hoisted_336 = { class: "font-semibold text-sm" }
const _hoisted_337 = { class: "flex items-center gap-3" }
const _hoisted_338 = { class: "font-bold text-sm" }
const _hoisted_339 = { class: "text-[11px] opacity-70" }
const _hoisted_340 = { class: "flex flex-wrap gap-1.5" }
const _hoisted_341 = ["onClick"]
const _hoisted_342 = ["onClick"]
const _hoisted_343 = ["onClick"]
const _hoisted_344 = ["onClick"]
const _hoisted_345 = { class: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-3" }
const _hoisted_346 = { class: "flex items-center gap-2 cursor-pointer" }
const _hoisted_347 = ["onUpdate:modelValue"]
const _hoisted_348 = { class: "flex items-center gap-1 cursor-pointer text-[#315bd7] dark:text-[#91d2ff]" }
const _hoisted_349 = ["name", "checked", "onChange"]
const _hoisted_350 = { class: "text-xs font-semibold truncate" }
const _hoisted_351 = { class: "text-[11px] font-mono truncate opacity-80" }
const _hoisted_352 = { class: "flex items-center justify-between gap-2 text-[11px] font-mono" }
const _hoisted_353 = { class: "truncate" }
const _hoisted_354 = ["onClick"]
const _hoisted_355 = {
  key: 1,
  class: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-5xl"
}
const _hoisted_356 = ["onClick"]
const _hoisted_357 = { class: "text-xs font-bold" }
const _hoisted_358 = { class: "font-mono text-xl font-bold text-[#315bd7] dark:text-[#91d2ff] tracking-widest mt-1" }
const _hoisted_359 = { class: "font-mono text-xs font-bold opacity-75" }
const _hoisted_360 = {
  key: 2,
  class: "space-y-4 max-w-4xl"
}
const _hoisted_361 = { class: "flex items-center justify-between mb-3" }
const _hoisted_362 = { class: "font-serif text-lg" }
const _hoisted_363 = { class: "grid grid-cols-2 sm:grid-cols-3 gap-2.5" }
const _hoisted_364 = ["onClick"]
const _hoisted_365 = { class: "min-w-0" }
const _hoisted_366 = { class: "text-xs font-bold truncate" }
const _hoisted_367 = { class: "text-[10px] opacity-70" }
const _hoisted_368 = { class: "grid grid-cols-1 md:grid-cols-2 gap-4" }
const _hoisted_369 = { class: "font-serif text-lg" }
const _hoisted_370 = { class: "flex flex-wrap gap-2" }
const _hoisted_371 = { class: "flex items-center justify-between gap-2 pt-2 border-t border-black/5 dark:border-white/5" }
const _hoisted_372 = { class: "text-xs font-semibold" }
const _hoisted_373 = ["aria-label"]
const _hoisted_374 = ["onClick", "aria-pressed", "title"]
const _hoisted_375 = { class: "font-serif text-lg" }
const _hoisted_376 = { class: "flex items-center gap-4" }
const _hoisted_377 = {
  viewBox: "0 0 140 140",
  class: "h-32 w-32 shrink-0"
}
const _hoisted_378 = { transform: "rotate(-90 70 70)" }
const _hoisted_379 = ["stroke"]
const _hoisted_380 = ["stroke", "stroke-dasharray", "stroke-dashoffset"]
const _hoisted_381 = {
  x: "70",
  y: "68",
  "text-anchor": "middle",
  "font-size": "24",
  "font-weight": "700",
  fill: "currentColor"
}
const _hoisted_382 = {
  x: "70",
  y: "86",
  "text-anchor": "middle",
  "font-size": "9",
  fill: "currentColor",
  opacity: "0.65"
}
const _hoisted_383 = { class: "min-w-0 flex-1 space-y-1.5 text-xs" }
const _hoisted_384 = { class: "flex items-center justify-between gap-2" }
const _hoisted_385 = { class: "flex items-center gap-1.5" }
const _hoisted_386 = /*#__PURE__*/_createElementVNode("span", { class: "h-2.5 w-2.5 rounded-full bg-[#10b981]" }, null, -1 /* HOISTED */)
const _hoisted_387 = { class: "flex items-center gap-1.5" }
const _hoisted_388 = /*#__PURE__*/_createElementVNode("span", { class: "h-2.5 w-2.5 rounded-full bg-[#f59e0b]" }, null, -1 /* HOISTED */)
const _hoisted_389 = { class: "text-[#f59e0b]" }
const _hoisted_390 = { class: "flex items-center gap-1.5" }
const _hoisted_391 = /*#__PURE__*/_createElementVNode("span", { class: "h-2.5 w-2.5 rounded-full bg-[#e11d48]" }, null, -1 /* HOISTED */)
const _hoisted_392 = { class: "text-[#e11d48]" }
const _hoisted_393 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-key text-sm" }, null, -1 /* HOISTED */)
const _hoisted_394 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-folder-open text-sm" }, null, -1 /* HOISTED */)
const _hoisted_395 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-circle-plus text-lg" }, null, -1 /* HOISTED */)
const _hoisted_396 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-clone text-sm" }, null, -1 /* HOISTED */)
const _hoisted_397 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-bars text-sm" }, null, -1 /* HOISTED */)
const _hoisted_398 = { class: "mb-4 flex items-start justify-between" }
const _hoisted_399 = { class: "font-serif text-[20px] sm:text-[22px]" }
const _hoisted_400 = ["aria-label"]
const _hoisted_401 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-xmark" }, null, -1 /* HOISTED */)
const _hoisted_402 = [
  _hoisted_401
]
const _hoisted_403 = { class: "grid grid-cols-3 gap-2 mb-3" }
const _hoisted_404 = { class: "block text-[10px] font-semibold" }
const _hoisted_405 = { value: "login" }
const _hoisted_406 = { value: "card" }
const _hoisted_407 = { value: "discount" }
const _hoisted_408 = { value: "wifi" }
const _hoisted_409 = { value: "note" }
const _hoisted_410 = { class: "block text-[10px] font-semibold" }
const _hoisted_411 = { value: "" }
const _hoisted_412 = ["value"]
const _hoisted_413 = { class: "block text-[10px] font-semibold" }
const _hoisted_414 = { value: "personal" }
const _hoisted_415 = { value: "family" }
const _hoisted_416 = { class: "mb-3 block text-[10.5px] font-semibold" }
const _hoisted_417 = ["placeholder"]
const _hoisted_418 = { class: "mb-3 block text-[10.5px] font-semibold" }
const _hoisted_419 = ["value"]
const _hoisted_420 = {
  key: 0,
  class: "mt-1 text-[10px] font-normal text-[#b45309] dark:text-[#fbbf24]"
}
const _hoisted_421 = { class: "mb-3 grid grid-cols-2 gap-2" }
const _hoisted_422 = { class: "block text-[10.5px] font-semibold" }
const _hoisted_423 = ["value"]
const _hoisted_424 = {
  key: 0,
  class: "mt-1 text-[10px] font-normal text-[#b45309] dark:text-[#fbbf24]"
}
const _hoisted_425 = { class: "block text-[10.5px] font-semibold" }
const _hoisted_426 = { class: "mt-1 flex gap-1.5" }
const _hoisted_427 = ["type", "value"]
const _hoisted_428 = ["aria-label"]
const _hoisted_429 = {
  key: 0,
  class: "mt-1 text-[10px] font-normal text-[#b45309] dark:text-[#fbbf24]"
}
const _hoisted_430 = { class: "mb-3 block text-[10.5px] font-semibold" }
const _hoisted_431 = ["placeholder"]
const _hoisted_432 = { class: "mb-3 block text-[10.5px] font-semibold" }
const _hoisted_433 = ["type", "value"]
const _hoisted_434 = { class: "mb-3 block text-[10.5px] font-semibold" }
const _hoisted_435 = {
  key: 0,
  class: "mt-1 text-[10px] font-normal text-[#b45309] dark:text-[#fbbf24]"
}
const _hoisted_436 = { class: "mb-3 grid grid-cols-2 gap-2" }
const _hoisted_437 = { class: "block text-[10.5px] font-semibold" }
const _hoisted_438 = ["value"]
const _hoisted_439 = { class: "block text-[10.5px] font-semibold" }
const _hoisted_440 = ["placeholder"]
const _hoisted_441 = { class: "mb-3" }
const _hoisted_442 = { class: "text-[10.5px] font-semibold" }
const _hoisted_443 = { class: "mt-1.5 flex flex-wrap gap-2" }
const _hoisted_444 = ["onClick", "aria-label", "aria-pressed"]
const _hoisted_445 = { class: "mb-3" }
const _hoisted_446 = { class: "text-[10.5px] font-semibold" }
const _hoisted_447 = { class: "mt-1.5 flex flex-wrap items-center gap-2" }
const _hoisted_448 = ["src", "alt"]
const _hoisted_449 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-camera text-[10px]" }, null, -1 /* HOISTED */)
const _hoisted_450 = ["disabled"]
const _hoisted_451 = /*#__PURE__*/_createElementVNode("i", { class: "fa-regular fa-trash-can text-[10px]" }, null, -1 /* HOISTED */)
const _hoisted_452 = {
  key: 0,
  class: "mt-1 text-[10.5px] font-normal text-[#b45309] dark:text-[#fbbf24]"
}
const _hoisted_453 = { class: "mb-3 block text-[10.5px] font-semibold" }
const _hoisted_454 = ["placeholder"]
const _hoisted_455 = { class: "mb-3 block text-[10.5px] font-semibold" }
const _hoisted_456 = { class: "flex gap-1.5 mt-1" }
const _hoisted_457 = ["type", "placeholder"]
const _hoisted_458 = ["aria-label"]
const _hoisted_459 = ["title", "aria-label"]
const _hoisted_460 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-dice" }, null, -1 /* HOISTED */)
const _hoisted_461 = [
  _hoisted_460
]
const _hoisted_462 = {
  key: 3,
  class: "mb-3 block text-[10.5px] font-semibold"
}
const _hoisted_463 = {
  key: 0,
  class: "mt-1 text-[10px] font-normal text-[#b45309] dark:text-[#fbbf24]"
}
const _hoisted_464 = {
  key: 4,
  class: "mb-3 block text-[10.5px] font-semibold"
}
const _hoisted_465 = {
  key: 0,
  class: "mt-1 text-[10px] font-normal text-[#b45309] dark:text-[#fbbf24]"
}
const _hoisted_466 = { class: "mb-3 block text-[10.5px] font-semibold" }
const _hoisted_467 = { class: "mb-4 space-y-2" }
const _hoisted_468 = { class: "flex items-center justify-between" }
const _hoisted_469 = { class: "text-[10.5px] font-semibold" }
const _hoisted_470 = ["onUpdate:modelValue", "placeholder"]
const _hoisted_471 = ["onUpdate:modelValue", "placeholder"]
const _hoisted_472 = ["onClick", "aria-label"]
const _hoisted_473 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-xmark text-xs" }, null, -1 /* HOISTED */)
const _hoisted_474 = [
  _hoisted_473
]
const _hoisted_475 = { class: "flex items-center justify-between gap-3" }
const _hoisted_476 = { class: "mb-3 flex items-center justify-between" }
const _hoisted_477 = { class: "font-serif text-xl" }
const _hoisted_478 = ["aria-label"]
const _hoisted_479 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-xmark" }, null, -1 /* HOISTED */)
const _hoisted_480 = [
  _hoisted_479
]
const _hoisted_481 = { class: "mb-3" }
const _hoisted_482 = { class: "mb-1 flex items-center justify-between text-[11px] font-semibold" }
const _hoisted_483 = { class: "font-mono opacity-70" }
const _hoisted_484 = { class: "h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10" }
const _hoisted_485 = { class: "mb-3 grid grid-cols-4 gap-1.5" }
const _hoisted_486 = ["onClick"]
const _hoisted_487 = { class: "mb-1 flex items-center justify-between text-[11px] font-semibold" }
const _hoisted_488 = { class: "font-mono" }
const _hoisted_489 = { class: "flex gap-2" }
const _hoisted_490 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-rotate mr-1 text-[10px]" }, null, -1 /* HOISTED */)
const _hoisted_491 = { class: "flex items-center justify-between" }
const _hoisted_492 = { class: "font-serif text-xl" }
const _hoisted_493 = ["aria-label"]
const _hoisted_494 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-xmark" }, null, -1 /* HOISTED */)
const _hoisted_495 = [
  _hoisted_494
]
const _hoisted_496 = { class: "text-xs opacity-80" }
const _hoisted_497 = { class: "space-y-3 text-xs" }
const _hoisted_498 = { class: "flex gap-2.5" }
const _hoisted_499 = /*#__PURE__*/_createElementVNode("span", { class: "grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#315bd7] text-[10px] font-bold text-white" }, "1", -1 /* HOISTED */)
const _hoisted_500 = { class: "min-w-0 flex-1" }
const _hoisted_501 = ["innerHTML"]
const _hoisted_502 = { class: "flex gap-2.5" }
const _hoisted_503 = /*#__PURE__*/_createElementVNode("span", { class: "grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#315bd7] text-[10px] font-bold text-white" }, "2", -1 /* HOISTED */)
const _hoisted_504 = { class: "min-w-0 flex-1" }
const _hoisted_505 = { class: "mt-1.5 flex items-center gap-2" }
const _hoisted_506 = /*#__PURE__*/_createElementVNode("i", { class: "fa-regular fa-copy" }, null, -1 /* HOISTED */)
const _hoisted_507 = { class: "mt-1 text-[10.5px] opacity-65" }
const _hoisted_508 = { class: "flex gap-2.5" }
const _hoisted_509 = /*#__PURE__*/_createElementVNode("span", { class: "grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#315bd7] text-[10px] font-bold text-white" }, "3", -1 /* HOISTED */)
const _hoisted_510 = ["innerHTML"]
const _hoisted_511 = { class: "flex gap-2.5" }
const _hoisted_512 = /*#__PURE__*/_createElementVNode("span", { class: "grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#315bd7] text-[10px] font-bold text-white" }, "4", -1 /* HOISTED */)
const _hoisted_513 = ["innerHTML"]
const _hoisted_514 = { class: "flex gap-2.5" }
const _hoisted_515 = /*#__PURE__*/_createElementVNode("span", { class: "grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#315bd7] text-[10px] font-bold text-white" }, "5", -1 /* HOISTED */)
const _hoisted_516 = ["innerHTML"]
const _hoisted_517 = { class: "text-[10.5px] opacity-65" }
const _hoisted_518 = {
  key: 6,
  ref: "discountFullscreenRef",
  class: "fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 overflow-auto bg-white p-6 text-black"
}
const _hoisted_519 = { class: "text-[18px] font-bold" }
const _hoisted_520 = ["innerHTML"]
const _hoisted_521 = { class: "break-all text-center font-mono text-[24px] font-semibold tracking-[0.2em]" }
const _hoisted_522 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-xmark" }, null, -1 /* HOISTED */)
const _hoisted_523 = { class: "flex items-center justify-between" }
const _hoisted_524 = { class: "font-serif text-xl" }
const _hoisted_525 = ["aria-label"]
const _hoisted_526 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-xmark" }, null, -1 /* HOISTED */)
const _hoisted_527 = [
  _hoisted_526
]
const _hoisted_528 = { class: "text-xs opacity-80" }
const _hoisted_529 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-download mr-1" }, null, -1 /* HOISTED */)
const _hoisted_530 = { class: "mb-1.5 flex items-center gap-2 text-xs font-bold" }
const _hoisted_531 = /*#__PURE__*/_createElementVNode("i", { class: "fa-brands fa-apple" }, null, -1 /* HOISTED */)
const _hoisted_532 = { class: "list-decimal space-y-1 pl-5 text-[11.5px]" }
const _hoisted_533 = ["innerHTML"]
const _hoisted_534 = ["innerHTML"]
const _hoisted_535 = /*#__PURE__*/_createElementVNode("div", { class: "mb-1.5 flex items-center gap-2 text-xs font-bold" }, [
  /*#__PURE__*/_createElementVNode("i", { class: "fa-brands fa-android" }),
  /*#__PURE__*/_createTextVNode(" Android (Chrome)")
], -1 /* HOISTED */)
const _hoisted_536 = { class: "list-decimal space-y-1 pl-5 text-[11.5px]" }
const _hoisted_537 = ["innerHTML"]
const _hoisted_538 = ["innerHTML"]
const _hoisted_539 = { class: "mb-1.5 flex items-center gap-2 text-xs font-bold" }
const _hoisted_540 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-desktop" }, null, -1 /* HOISTED */)
const _hoisted_541 = { class: "list-decimal space-y-1 pl-5 text-[11.5px]" }
const _hoisted_542 = ["innerHTML"]
const _hoisted_543 = { class: "text-[10.5px] opacity-65" }
const _hoisted_544 = { class: "font-mono" }
const _hoisted_545 = { class: "flex items-center justify-between" }
const _hoisted_546 = { class: "font-serif text-xl" }
const _hoisted_547 = ["aria-label"]
const _hoisted_548 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-xmark" }, null, -1 /* HOISTED */)
const _hoisted_549 = [
  _hoisted_548
]
const _hoisted_550 = { class: "grid grid-cols-2 gap-1.5" }
const _hoisted_551 = {
  key: 0,
  class: "space-y-3"
}
const _hoisted_552 = { class: "text-[11.5px] opacity-75" }
const _hoisted_553 = {
  key: 0,
  class: "rounded-lg border border-[#e11d48]/40 bg-[#e11d48]/10 p-2 text-xs text-[#e11d48]"
}
const _hoisted_554 = {
  key: 1,
  class: "rounded-lg border border-[#d8e0f3] dark:border-[#3b4c6f] p-2 text-xs space-y-0.5"
}
const _hoisted_555 = { class: "font-semibold text-[#329371]" }
const _hoisted_556 = {
  key: 0,
  class: "opacity-70 font-normal"
}
const _hoisted_557 = { key: 0 }
const _hoisted_558 = {
  key: 2,
  class: "flex items-start gap-2 rounded-lg border border-[#d97706]/50 p-2 text-[11px] text-[#d97706]"
}
const _hoisted_559 = {
  key: 3,
  class: "rounded-lg border border-[#329371]/40 bg-[#329371]/10 p-2 text-xs text-[#329371]"
}
const _hoisted_560 = { class: "text-[10.5px] text-[#d97706]" }
const _hoisted_561 = ["disabled"]
const _hoisted_562 = {
  key: 1,
  class: "space-y-3"
}
const _hoisted_563 = { class: "text-[11.5px] opacity-75" }
const _hoisted_564 = { class: "mb-1 text-[10.5px] font-semibold" }
const _hoisted_565 = { class: "grid grid-cols-2 gap-1.5" }
const _hoisted_566 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-lock mr-1 text-[10px]" }, null, -1 /* HOISTED */)
const _hoisted_567 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-users mr-1 text-[10px]" }, null, -1 /* HOISTED */)
const _hoisted_568 = {
  key: 0,
  class: "text-xs font-semibold text-[#329371]"
}
const _hoisted_569 = { class: "text-[10.5px] text-[#d97706]" }
const _hoisted_570 = ["disabled"]
const _hoisted_571 = { class: "font-serif text-xl" }
const _hoisted_572 = ["placeholder"]
const _hoisted_573 = ["placeholder"]
const _hoisted_574 = ["placeholder"]
const _hoisted_575 = { class: "pt-3 border-t border-black/10 dark:border-white/10" }
const _hoisted_576 = { class: "flex items-center justify-between gap-3 text-xs font-semibold opacity-60" }
const _hoisted_577 = { class: "mt-1 text-[10px] leading-snug opacity-60" }
const _hoisted_578 = { class: "space-y-2" }
const _hoisted_579 = { class: "flex items-center justify-between gap-3" }
const _hoisted_580 = { class: "text-sm font-semibold" }
const _hoisted_581 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-shield-halved text-xs opacity-70" }, null, -1 /* HOISTED */)
const _hoisted_582 = { class: "text-[10.5px] leading-snug opacity-70" }
const _hoisted_583 = {
  key: 0,
  class: "text-[10.5px] text-[#d97706]"
}
const _hoisted_584 = { class: "text-[10.5px] font-semibold text-[#d97706]" }
const _hoisted_585 = { class: "grid grid-cols-2 gap-1 rounded-lg border p-3 text-center font-mono text-xs select-text" }
const _hoisted_586 = { class: "flex gap-2" }
const _hoisted_587 = { class: "text-[10.5px] leading-snug" }
const _hoisted_588 = { class: "flex justify-center" }
const _hoisted_589 = ["innerHTML"]
const _hoisted_590 = { class: "text-[10px] opacity-70" }
const _hoisted_591 = ["placeholder"]
const _hoisted_592 = { class: "flex gap-2" }
const _hoisted_593 = { class: "text-[10.5px] opacity-70" }
const _hoisted_594 = ["placeholder"]
const _hoisted_595 = ["placeholder"]
const _hoisted_596 = ["placeholder"]
const _hoisted_597 = { class: "font-serif text-xl" }
const _hoisted_598 = { class: "p-3 rounded-lg border font-mono text-xs font-bold text-center select-text" }
const _hoisted_599 = { class: "flex gap-2" }
const _hoisted_600 = { class: "flex justify-between items-center" }
const _hoisted_601 = { class: "font-serif text-xl" }
const _hoisted_602 = ["aria-label"]
const _hoisted_603 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-xmark" }, null, -1 /* HOISTED */)
const _hoisted_604 = [
  _hoisted_603
]
const _hoisted_605 = { class: "text-[10px] font-sans block opacity-75" }
const _hoisted_606 = { class: "pt-2 space-y-2" }
const _hoisted_607 = { class: "text-xs font-bold opacity-75" }
const _hoisted_608 = { class: "min-w-0" }
const _hoisted_609 = { class: "opacity-70 ml-1" }
const _hoisted_610 = {
  key: 0,
  class: "text-[10px] opacity-60"
}
const _hoisted_611 = ["onClick"]
const _hoisted_612 = { class: "flex justify-between items-center" }
const _hoisted_613 = { class: "font-serif text-xl" }
const _hoisted_614 = { class: "flex gap-2" }
const _hoisted_615 = ["aria-label"]
const _hoisted_616 = /*#__PURE__*/_createElementVNode("i", { class: "fa-solid fa-xmark" }, null, -1 /* HOISTED */)
const _hoisted_617 = [
  _hoisted_616
]
const _hoisted_618 = { class: "flex-1 overflow-y-auto space-y-1.5 font-mono text-[11px]" }
const _hoisted_619 = {
  key: 0,
  class: "text-center py-6 opacity-60"
}
const _hoisted_620 = { class: "opacity-60" }
const _hoisted_621 = { class: "fixed bottom-20 lg:bottom-5 right-4 z-[95] flex flex-col gap-2" }
const _hoisted_622 = ["role"]

return function render(_ctx, _cache) {
  return (_openBlock(), _createElementBlock("div", {
    class: _normalizeClass([_ctx.theme === 'dark' ? 'dark bg-[#121a2c] text-[#edf1ff]' : 'bg-[#eef2ff] text-[#1d2b49]', 'vault-theme h-[100dvh] w-[100vw] overflow-hidden font-sans selection:bg-[#dce5ff] flex flex-col'])
  }, [
    (_ctx.loading)
      ? (_openBlock(), _createElementBlock("div", _hoisted_1, [
          _createElementVNode("div", _hoisted_2, [
            _hoisted_3,
            _createElementVNode("div", _hoisted_4, _toDisplayString(_ctx.t('app.loading')), 1 /* TEXT */)
          ])
        ]))
      : (!_ctx.sessionToken)
        ? (_openBlock(), _createElementBlock("div", _hoisted_5, [
            _createElementVNode("div", _hoisted_6, [
              _createElementVNode("div", _hoisted_7, [
                _hoisted_8,
                _createElementVNode("div", null, [
                  _hoisted_9,
                  _createElementVNode("div", _hoisted_10, _toDisplayString(_ctx.t('auth.art.tagline')), 1 /* TEXT */),
                  _createElementVNode("div", _hoisted_11, _toDisplayString(_ctx.t('auth.art.fravashi')), 1 /* TEXT */)
                ])
              ]),
              _createElementVNode("div", _hoisted_12, [
                _createElementVNode("div", _hoisted_13, [
                  (_openBlock(), _createElementBlock("svg", _hoisted_14, _hoisted_17)),
                  _hoisted_18
                ]),
                _hoisted_19,
                _createElementVNode("h1", _hoisted_20, _toDisplayString(_ctx.t('auth.art.headline')), 1 /* TEXT */),
                _createElementVNode("p", {
                  class: "mt-2.5 text-xs leading-relaxed text-[#c6d3f2]",
                  innerHTML: _ctx.t('auth.art.descHtml')
                }, null, 8 /* PROPS */, _hoisted_21)
              ]),
              _createElementVNode("div", _hoisted_22, [
                _createElementVNode("div", _hoisted_23, [
                  _hoisted_24,
                  _createElementVNode("div", null, [
                    _createElementVNode("div", _hoisted_25, _toDisplayString(_ctx.t('auth.art.protected')), 1 /* TEXT */),
                    _createElementVNode("div", _hoisted_26, _toDisplayString(_ctx.t('auth.art.protectedSub')), 1 /* TEXT */)
                  ])
                ]),
                _hoisted_27
              ])
            ]),
            _createElementVNode("div", _hoisted_28, [
              _createElementVNode("div", _hoisted_29, [
                _createElementVNode("div", {
                  class: "flex items-center gap-1",
                  role: "group",
                  "aria-label": _ctx.t('lang.label')
                }, [
                  (_openBlock(), _createElementBlock(_Fragment, null, _renderList(['ru', 'en'], (l) => {
                    return _createElementVNode("button", {
                      key: l,
                      onClick: $event => (_ctx.setLang(l)),
                      "aria-pressed": _ctx.lang === l,
                      title: _ctx.t('lang.name.' + l),
                      class: _normalizeClass(['h-9 w-9 rounded-lg border text-[11px] font-semibold uppercase transition', _ctx.lang === l ? 'border-[#315bd7] bg-[#315bd7] text-white' : (_ctx.theme === 'dark' ? 'border-[#3b4c6f] bg-[#202d49] text-[#91d2ff]' : 'border-[#d8e0f3] bg-white text-[#536ca7]')])
                    }, _toDisplayString(l), 11 /* TEXT, CLASS, PROPS */, _hoisted_31)
                  }), 64 /* STABLE_FRAGMENT */))
                ], 8 /* PROPS */, _hoisted_30),
                _createElementVNode("button", {
                  onClick: _cache[0] || (_cache[0] = $event => (_ctx.setTheme(_ctx.theme === 'dark' ? 'light' : 'dark'))),
                  title: _ctx.t('common.theme'),
                  "aria-label": _ctx.t('common.theme'),
                  class: _normalizeClass(['grid h-9 w-9 place-items-center rounded-lg border transition', _ctx.theme === 'dark' ? 'border-[#3b4c6f] bg-[#202d49] text-[#f5cf73]' : 'border-[#d8e0f3] bg-white text-[#536ca7]'])
                }, [
                  _createElementVNode("i", {
                    class: _normalizeClass(_ctx.theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon')
                  }, null, 2 /* CLASS */)
                ], 10 /* CLASS, PROPS */, _hoisted_32)
              ]),
              _createElementVNode("div", {
                class: _normalizeClass(['w-full max-w-[400px] rounded-2xl border p-6 sm:p-7 shadow-[0_24px_90px_rgba(20,36,74,0.12)]', _ctx.theme === 'dark' ? 'border-[#324260] bg-[#1a2741]' : 'border-[#dce3f4] bg-[#fffefa]'])
              }, [
                _createElementVNode("div", _hoisted_33, [
                  _hoisted_34,
                  _createElementVNode("div", null, [
                    _hoisted_35,
                    _createElementVNode("div", _hoisted_36, _toDisplayString(_ctx.t('auth.art.fravashi')), 1 /* TEXT */)
                  ])
                ]),
                _createElementVNode("h2", _hoisted_37, _toDisplayString(_ctx.t('auth.title.' + _ctx.authMode)), 1 /* TEXT */),
                _createElementVNode("p", {
                  class: _normalizeClass(['mt-1 mb-5 text-[11px]', _ctx.theme === 'dark' ? 'text-[#aab8d5]' : 'text-[#7281a4]'])
                }, _toDisplayString(_ctx.t('auth.subtitle')), 3 /* TEXT, CLASS */),
                (_ctx.authMode === 'login' && _ctx.totpStepActive)
                  ? (_openBlock(), _createElementBlock("div", _hoisted_38, [
                      _createElementVNode("p", _hoisted_39, _toDisplayString(_ctx.totpUseBackup ? _ctx.t('totp.login.backupHint') : _ctx.t('totp.login.hint')), 1 /* TEXT */),
                      _createElementVNode("label", _hoisted_40, [
                        _createTextVNode(_toDisplayString(_ctx.totpUseBackup ? _ctx.t('totp.login.backupCode') : _ctx.t('totp.code')) + " ", 1 /* TEXT */),
                        _withDirectives(_createElementVNode("input", {
                          "onUpdate:modelValue": _cache[1] || (_cache[1] = $event => ((_ctx.totpLoginCode) = $event)),
                          inputmode: _ctx.totpUseBackup ? 'text' : 'numeric',
                          autocomplete: "one-time-code",
                          onKeyup: _cache[2] || (_cache[2] = _withKeys((...args) => (_ctx.handleTotpLogin && _ctx.handleTotpLogin(...args)), ["enter"])),
                          placeholder: _ctx.totpUseBackup ? 'XXXX-XXXX-XXXX-XXXX' : '123456',
                          maxlength: _ctx.totpUseBackup ? 24 : 6,
                          class: _normalizeClass(['mt-1.5 h-10 w-full rounded-lg border px-3 font-mono text-[14px] tracking-widest font-normal outline-none focus:border-[#6d8df0]', _ctx.theme === 'dark' ? 'border-[#3b4d70] bg-[#18243d] text-white' : 'border-[#d8e0f3] bg-white text-[#263756]'])
                        }, null, 42 /* CLASS, PROPS, HYDRATE_EVENTS */, _hoisted_41), [
                          [_vModelText, _ctx.totpLoginCode]
                        ])
                      ]),
                      _createElementVNode("button", {
                        onClick: _cache[3] || (_cache[3] = (...args) => (_ctx.handleTotpLogin && _ctx.handleTotpLogin(...args))),
                        class: "mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#315bd7] text-[12px] font-semibold text-white shadow-[0_5px_14px_rgba(49,91,215,0.28)] transition hover:bg-[#264cc4]"
                      }, [
                        _hoisted_42,
                        _createTextVNode(" " + _toDisplayString(_ctx.t('totp.login.verify')), 1 /* TEXT */)
                      ]),
                      _createElementVNode("div", _hoisted_43, [
                        _createElementVNode("a", {
                          href: "#",
                          onClick: _cache[4] || (_cache[4] = _withModifiers((...args) => (_ctx.toggleTotpBackup && _ctx.toggleTotpBackup(...args)), ["prevent"])),
                          class: "font-semibold text-[#315bd7] dark:text-[#91d2ff]"
                        }, _toDisplayString(_ctx.totpUseBackup ? _ctx.t('totp.login.useApp') : _ctx.t('totp.login.useBackup')), 1 /* TEXT */),
                        _createElementVNode("a", {
                          href: "#",
                          onClick: _cache[5] || (_cache[5] = _withModifiers((...args) => (_ctx.cancelTotpLogin && _ctx.cancelTotpLogin(...args)), ["prevent"])),
                          class: "text-[#7281a4] hover:underline"
                        }, _toDisplayString(_ctx.t('auth.backToLogin')), 1 /* TEXT */)
                      ])
                    ]))
                  : (_ctx.authMode === 'login')
                    ? (_openBlock(), _createElementBlock("div", _hoisted_44, [
                        _createElementVNode("label", _hoisted_45, [
                          _createTextVNode(_toDisplayString(_ctx.t('auth.username')) + " ", 1 /* TEXT */),
                          _withDirectives(_createElementVNode("input", {
                            "onUpdate:modelValue": _cache[6] || (_cache[6] = $event => ((_ctx.loginForm.username) = $event)),
                            type: "text",
                            placeholder: "admin",
                            class: _normalizeClass(['mt-1.5 h-10 w-full rounded-lg border px-3 text-[13px] font-normal outline-none focus:border-[#6d8df0]', _ctx.theme === 'dark' ? 'border-[#3b4d70] bg-[#18243d] text-white' : 'border-[#d8e0f3] bg-white text-[#263756]'])
                          }, null, 2 /* CLASS */), [
                            [_vModelText, _ctx.loginForm.username]
                          ])
                        ]),
                        _createElementVNode("label", _hoisted_46, [
                          _createTextVNode(_toDisplayString(_ctx.t('auth.masterPassword')) + " ", 1 /* TEXT */),
                          _createElementVNode("div", _hoisted_47, [
                            _withDirectives(_createElementVNode("input", {
                              "onUpdate:modelValue": _cache[7] || (_cache[7] = $event => ((_ctx.loginForm.password) = $event)),
                              type: _ctx.showLoginPwd ? 'text' : 'password',
                              onKeyup: _cache[8] || (_cache[8] = _withKeys((...args) => (_ctx.handleLogin && _ctx.handleLogin(...args)), ["enter"])),
                              placeholder: "••••••••••••",
                              class: _normalizeClass(['h-10 w-full rounded-lg border pl-3 pr-9 text-[13px] font-normal outline-none focus:border-[#6d8df0]', _ctx.theme === 'dark' ? 'border-[#3b4d70] bg-[#18243d] text-white' : 'border-[#d8e0f3] bg-white text-[#263756]'])
                            }, null, 42 /* CLASS, PROPS, HYDRATE_EVENTS */, _hoisted_48), [
                              [_vModelDynamic, _ctx.loginForm.password]
                            ]),
                            _createElementVNode("button", {
                              type: "button",
                              onClick: _cache[9] || (_cache[9] = $event => (_ctx.showLoginPwd = !_ctx.showLoginPwd)),
                              "aria-label": _ctx.t(_ctx.showLoginPwd ? 'common.hidePassword' : 'common.showPassword'),
                              class: "absolute right-3 top-1/2 -translate-y-1/2 text-xs opacity-60 hover:opacity-100"
                            }, [
                              _createElementVNode("i", {
                                class: _normalizeClass(_ctx.showLoginPwd ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye')
                              }, null, 2 /* CLASS */)
                            ], 8 /* PROPS */, _hoisted_49)
                          ])
                        ]),
                        _createElementVNode("button", {
                          onClick: _cache[10] || (_cache[10] = (...args) => (_ctx.handleLogin && _ctx.handleLogin(...args))),
                          class: "mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#315bd7] text-[12px] font-semibold text-white shadow-[0_5px_14px_rgba(49,91,215,0.28)] transition hover:bg-[#264cc4]"
                        }, [
                          _hoisted_50,
                          _createTextVNode(" " + _toDisplayString(_ctx.t('auth.unlock')), 1 /* TEXT */)
                        ]),
                        _createElementVNode("div", _hoisted_51, [
                          _createElementVNode("a", {
                            href: "#",
                            onClick: _cache[11] || (_cache[11] = _withModifiers($event => (_ctx.authMode = 'register'), ["prevent"])),
                            class: "font-semibold text-[#315bd7] dark:text-[#91d2ff]"
                          }, _toDisplayString(_ctx.t('auth.createAccount')), 1 /* TEXT */),
                          _createElementVNode("a", {
                            href: "#",
                            onClick: _cache[12] || (_cache[12] = _withModifiers($event => (_ctx.authMode = 'recovery'), ["prevent"])),
                            class: "text-[#7281a4] hover:underline"
                          }, _toDisplayString(_ctx.t('auth.recoveryKeyLink')), 1 /* TEXT */)
                        ])
                      ]))
                    : (_ctx.authMode === 'register')
                      ? (_openBlock(), _createElementBlock("div", _hoisted_52, [
                          _createElementVNode("label", _hoisted_53, [
                            _createTextVNode(_toDisplayString(_ctx.t('auth.username')) + " ", 1 /* TEXT */),
                            _withDirectives(_createElementVNode("input", {
                              "onUpdate:modelValue": _cache[13] || (_cache[13] = $event => ((_ctx.regForm.username) = $event)),
                              type: "text",
                              placeholder: "admin",
                              class: _normalizeClass(['mt-1 h-10 w-full rounded-lg border px-3 text-[13px] font-normal outline-none', _ctx.theme === 'dark' ? 'border-[#3b4d70] bg-[#18243d] text-white' : 'border-[#d8e0f3] bg-white text-[#263756]'])
                            }, null, 2 /* CLASS */), [
                              [_vModelText, _ctx.regForm.username]
                            ])
                          ]),
                          _createElementVNode("label", _hoisted_54, [
                            _createTextVNode(_toDisplayString(_ctx.t('auth.masterPassword')) + " ", 1 /* TEXT */),
                            _withDirectives(_createElementVNode("input", {
                              "onUpdate:modelValue": _cache[14] || (_cache[14] = $event => ((_ctx.regForm.password) = $event)),
                              type: "password",
                              class: _normalizeClass(['mt-1 h-10 w-full rounded-lg border px-3 text-[13px] font-normal outline-none', _ctx.theme === 'dark' ? 'border-[#3b4d70] bg-[#18243d] text-white' : 'border-[#d8e0f3] bg-white text-[#263756]'])
                            }, null, 2 /* CLASS */), [
                              [_vModelText, _ctx.regForm.password]
                            ])
                          ]),
                          _createElementVNode("label", _hoisted_55, [
                            _createTextVNode(_toDisplayString(_ctx.t('auth.repeatPassword')) + " ", 1 /* TEXT */),
                            _withDirectives(_createElementVNode("input", {
                              "onUpdate:modelValue": _cache[15] || (_cache[15] = $event => ((_ctx.regForm.passwordConfirm) = $event)),
                              type: "password",
                              class: _normalizeClass(['mt-1 h-10 w-full rounded-lg border px-3 text-[13px] font-normal outline-none', _ctx.theme === 'dark' ? 'border-[#3b4d70] bg-[#18243d] text-white' : 'border-[#d8e0f3] bg-white text-[#263756]'])
                            }, null, 2 /* CLASS */), [
                              [_vModelText, _ctx.regForm.passwordConfirm]
                            ])
                          ]),
                          (!_ctx.hasUsers && _ctx.setupTokenRequired)
                            ? (_openBlock(), _createElementBlock("label", _hoisted_56, [
                                _createTextVNode(_toDisplayString(_ctx.t('auth.setupToken')) + " ", 1 /* TEXT */),
                                _withDirectives(_createElementVNode("input", {
                                  "onUpdate:modelValue": _cache[16] || (_cache[16] = $event => ((_ctx.regForm.setupToken) = $event)),
                                  type: "password",
                                  autocomplete: "off",
                                  class: _normalizeClass(['mt-1 h-10 w-full rounded-lg border px-3 font-mono text-[13px] font-normal outline-none', _ctx.theme === 'dark' ? 'border-[#3b4d70] bg-[#18243d] text-white' : 'border-[#d8e0f3] bg-white text-[#263756]'])
                                }, null, 2 /* CLASS */), [
                                  [_vModelText, _ctx.regForm.setupToken]
                                ]),
                                _createElementVNode("span", _hoisted_57, _toDisplayString(_ctx.t('auth.setupTokenHint')), 1 /* TEXT */)
                              ]))
                            : _createCommentVNode("v-if", true),
                          (_ctx.hasUsers)
                            ? (_openBlock(), _createElementBlock(_Fragment, { key: 1 }, [
                                _createElementVNode("label", _hoisted_58, [
                                  _createTextVNode(_toDisplayString(_ctx.t('auth.inviteCode')) + " ", 1 /* TEXT */),
                                  _withDirectives(_createElementVNode("input", {
                                    "onUpdate:modelValue": _cache[17] || (_cache[17] = $event => ((_ctx.regForm.inviteCode) = $event)),
                                    type: "text",
                                    class: _normalizeClass(['mt-1 h-10 w-full rounded-lg border px-3 font-mono text-[13px] font-normal outline-none', _ctx.theme === 'dark' ? 'border-[#3b4d70] bg-[#18243d] text-white' : 'border-[#d8e0f3] bg-white text-[#263756]'])
                                  }, null, 2 /* CLASS */), [
                                    [_vModelText, _ctx.regForm.inviteCode]
                                  ])
                                ]),
                                _createElementVNode("label", _hoisted_59, [
                                  _withDirectives(_createElementVNode("input", {
                                    type: "checkbox",
                                    "onUpdate:modelValue": _cache[18] || (_cache[18] = $event => ((_ctx.regForm.allowEscrow) = $event)),
                                    class: "accent-[#315bd7]"
                                  }, null, 512 /* NEED_PATCH */), [
                                    [_vModelCheckbox, _ctx.regForm.allowEscrow]
                                  ]),
                                  _createElementVNode("span", null, _toDisplayString(_ctx.t('auth.allowEscrow')), 1 /* TEXT */)
                                ])
                              ], 64 /* STABLE_FRAGMENT */))
                            : _createCommentVNode("v-if", true),
                          _createElementVNode("button", {
                            onClick: _cache[19] || (_cache[19] = (...args) => (_ctx.handleRegister && _ctx.handleRegister(...args))),
                            class: "mt-2 h-10 w-full rounded-lg bg-[#315bd7] text-[12px] font-semibold text-white hover:bg-[#264cc4]"
                          }, _toDisplayString(_ctx.t('auth.register')), 1 /* TEXT */),
                          _createElementVNode("div", _hoisted_60, [
                            _createElementVNode("a", {
                              href: "#",
                              onClick: _cache[20] || (_cache[20] = _withModifiers($event => (_ctx.authMode = 'login'), ["prevent"])),
                              class: "text-[#315bd7] dark:text-[#91d2ff]"
                            }, _toDisplayString(_ctx.t('auth.backToLogin')), 1 /* TEXT */)
                          ])
                        ]))
                      : (_openBlock(), _createElementBlock("div", _hoisted_61, [
                          _createElementVNode("label", _hoisted_62, [
                            _createTextVNode(_toDisplayString(_ctx.t('auth.username')) + " ", 1 /* TEXT */),
                            _withDirectives(_createElementVNode("input", {
                              "onUpdate:modelValue": _cache[21] || (_cache[21] = $event => ((_ctx.recForm.username) = $event)),
                              type: "text",
                              class: _normalizeClass(['mt-1 h-10 w-full rounded-lg border px-3 text-[13px] font-normal outline-none', _ctx.theme === 'dark' ? 'border-[#3b4d70] bg-[#18243d] text-white' : 'border-[#d8e0f3] bg-white text-[#263756]'])
                            }, null, 2 /* CLASS */), [
                              [_vModelText, _ctx.recForm.username]
                            ])
                          ]),
                          _createElementVNode("label", _hoisted_63, [
                            _createTextVNode(_toDisplayString(_ctx.t('auth.recoveryKey')) + " ", 1 /* TEXT */),
                            _withDirectives(_createElementVNode("textarea", {
                              "onUpdate:modelValue": _cache[22] || (_cache[22] = $event => ((_ctx.recForm.recoveryKey) = $event)),
                              rows: "2",
                              class: _normalizeClass(['mt-1 w-full rounded-lg border p-2.5 font-mono text-[12px] font-normal outline-none', _ctx.theme === 'dark' ? 'border-[#3b4d70] bg-[#18243d] text-white' : 'border-[#d8e0f3] bg-white text-[#263756]'])
                            }, null, 2 /* CLASS */), [
                              [_vModelText, _ctx.recForm.recoveryKey]
                            ])
                          ]),
                          _createElementVNode("label", _hoisted_64, [
                            _createTextVNode(_toDisplayString(_ctx.t('auth.newMasterPassword')) + " ", 1 /* TEXT */),
                            _withDirectives(_createElementVNode("input", {
                              "onUpdate:modelValue": _cache[23] || (_cache[23] = $event => ((_ctx.recForm.newPassword) = $event)),
                              type: "password",
                              class: _normalizeClass(['mt-1 h-10 w-full rounded-lg border px-3 text-[13px] font-normal outline-none', _ctx.theme === 'dark' ? 'border-[#3b4d70] bg-[#18243d] text-white' : 'border-[#d8e0f3] bg-white text-[#263756]'])
                            }, null, 2 /* CLASS */), [
                              [_vModelText, _ctx.recForm.newPassword]
                            ])
                          ]),
                          _createElementVNode("button", {
                            onClick: _cache[24] || (_cache[24] = (...args) => (_ctx.handleRecoveryReset && _ctx.handleRecoveryReset(...args))),
                            class: "mt-2 h-10 w-full rounded-lg bg-[#315bd7] text-[12px] font-semibold text-white hover:bg-[#264cc4]"
                          }, _toDisplayString(_ctx.t('auth.restoreAccess')), 1 /* TEXT */),
                          _createElementVNode("div", _hoisted_65, [
                            _createElementVNode("a", {
                              href: "#",
                              onClick: _cache[25] || (_cache[25] = _withModifiers($event => (_ctx.authMode = 'login'), ["prevent"])),
                              class: "text-[#315bd7] dark:text-[#91d2ff]"
                            }, _toDisplayString(_ctx.t('auth.backToLogin')), 1 /* TEXT */)
                          ])
                        ]))
              ], 2 /* CLASS */)
            ])
          ]))
        : (_openBlock(), _createElementBlock("div", _hoisted_66, [
            (_ctx.mobileNavOpen)
              ? (_openBlock(), _createElementBlock("div", {
                  key: 0,
                  class: "fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs lg:hidden",
                  onClick: _cache[26] || (_cache[26] = $event => (_ctx.mobileNavOpen = false))
                }))
              : _createCommentVNode("v-if", true),
            _createElementVNode("aside", {
              class: _normalizeClass([
                    'w-[265px] lg:w-[248px] shrink-0 flex flex-col border-r z-[80] transition-transform duration-200 overflow-y-auto safe-top-sidebar',
                    _ctx.theme === 'dark' ? 'border-[#263450] bg-[#17223a]' : 'border-[#1d315b] bg-[#1d315b]',
                    _ctx.mobileNavOpen ? 'fixed inset-y-0 left-0 translate-x-0 shadow-2xl' : 'hidden lg:flex'
                ])
            }, [
              _createElementVNode("div", {
                class: "flex h-[60px] shrink-0 items-center justify-between border-b border-white/[0.12] px-5 cursor-pointer",
                onClick: _cache[28] || (_cache[28] = $event => (_ctx.setFilter('all', 'all', 'all')))
              }, [
                _createElementVNode("div", _hoisted_67, [
                  _hoisted_68,
                  _createElementVNode("div", null, [
                    _hoisted_69,
                    _createElementVNode("div", _hoisted_70, _toDisplayString(_ctx.t('nav.tagline')), 1 /* TEXT */)
                  ])
                ]),
                _createElementVNode("button", {
                  class: "lg:hidden h-8 w-8 rounded-lg bg-white/10 text-white",
                  onClick: _cache[27] || (_cache[27] = _withModifiers($event => (_ctx.mobileNavOpen = false), ["stop"])),
                  "aria-label": _ctx.t('nav.close'),
                  title: _ctx.t('nav.close')
                }, _hoisted_73, 8 /* PROPS */, _hoisted_71)
              ]),
              _createElementVNode("div", _hoisted_74, [
                _createElementVNode("div", _hoisted_75, _toDisplayString(_ctx.t('nav.library')), 1 /* TEXT */),
                _createElementVNode("button", {
                  onClick: _cache[29] || (_cache[29] = $event => (_ctx.setFilter('all', 'all', 'all'))),
                  class: _normalizeClass(['mb-1 flex h-9 w-full items-center gap-3 rounded-lg px-3 text-left text-[12px] transition-colors', (_ctx.currentView === 'all' && _ctx.currentCategory === 'all' && _ctx.currentFolder === 'all' && _ctx.rightPaneMode === 'item') ? 'bg-[#496fe8] font-semibold text-white shadow-[0_5px_18px_rgba(56,91,207,0.32)]' : 'text-[#d3def8] hover:bg-white/[0.09]'])
                }, [
                  _hoisted_76,
                  _createElementVNode("span", _hoisted_77, _toDisplayString(_ctx.t('nav.allItems')), 1 /* TEXT */),
                  _createElementVNode("span", _hoisted_78, _toDisplayString(_ctx.activeItems.length), 1 /* TEXT */)
                ], 2 /* CLASS */),
                _createElementVNode("button", {
                  onClick: _cache[30] || (_cache[30] = $event => (_ctx.setFilter('all', 'favorites', 'all'))),
                  class: _normalizeClass(['mb-1 flex h-9 w-full items-center gap-3 rounded-lg px-3 text-left text-[12px] transition-colors', (_ctx.currentCategory === 'favorites' && _ctx.rightPaneMode === 'item') ? 'bg-[#496fe8] font-semibold text-white shadow-[0_5px_18px_rgba(56,91,207,0.32)]' : 'text-[#d3def8] hover:bg-white/[0.09]'])
                }, [
                  _hoisted_79,
                  _createElementVNode("span", _hoisted_80, _toDisplayString(_ctx.t('nav.favorites')), 1 /* TEXT */),
                  _createElementVNode("span", _hoisted_81, _toDisplayString(_ctx.countFavorites), 1 /* TEXT */)
                ], 2 /* CLASS */),
                _createElementVNode("div", _hoisted_82, [
                  _createElementVNode("button", {
                    onClick: _cache[31] || (_cache[31] = $event => (_ctx.setFilter('personal', 'all', 'all'))),
                    class: _normalizeClass(['flex h-8 items-center justify-center gap-1.5 rounded-lg px-2 text-[11px] transition-colors', (_ctx.currentView === 'personal' && _ctx.rightPaneMode === 'item') ? 'bg-[#496fe8] font-semibold text-white' : 'bg-white/[0.05] text-[#d3def8] hover:bg-white/[0.1]'])
                  }, [
                    _hoisted_83,
                    _createTextVNode(" " + _toDisplayString(_ctx.t('nav.personal')) + " (" + _toDisplayString(_ctx.countByScope('personal')) + ") ", 1 /* TEXT */)
                  ], 2 /* CLASS */),
                  _createElementVNode("button", {
                    onClick: _cache[32] || (_cache[32] = $event => (_ctx.setFilter('family', 'all', 'all'))),
                    class: _normalizeClass(['flex h-8 items-center justify-center gap-1.5 rounded-lg px-2 text-[11px] transition-colors', (_ctx.currentView === 'family' && _ctx.rightPaneMode === 'item') ? 'bg-[#496fe8] font-semibold text-white' : 'bg-white/[0.05] text-[#d3def8] hover:bg-white/[0.1]'])
                  }, [
                    _hoisted_84,
                    _createTextVNode(" " + _toDisplayString(_ctx.t('nav.family')) + " (" + _toDisplayString(_ctx.countByScope('family')) + ") ", 1 /* TEXT */)
                  ], 2 /* CLASS */)
                ])
              ]),
              _createElementVNode("div", _hoisted_85, [
                _createElementVNode("div", {
                  class: "mb-2 flex items-center justify-between px-3 cursor-pointer",
                  onClick: _cache[35] || (_cache[35] = $event => (_ctx.toggleNavSection('folders')))
                }, [
                  _createElementVNode("span", _hoisted_86, _toDisplayString(_ctx.t('nav.folders')), 1 /* TEXT */),
                  _createElementVNode("div", _hoisted_87, [
                    _createElementVNode("button", {
                      onClick: _cache[33] || (_cache[33] = _withModifiers($event => (_ctx.autoSortItemsIntoFolders(true)), ["stop"])),
                      title: _ctx.t('nav.autoSort'),
                      "aria-label": _ctx.t('nav.autoSort'),
                      class: "grid h-5 w-5 place-items-center rounded text-[#f4c96b] hover:bg-white/[0.1]"
                    }, _hoisted_90, 8 /* PROPS */, _hoisted_88),
                    _createElementVNode("button", {
                      onClick: _cache[34] || (_cache[34] = _withModifiers((...args) => (_ctx.createNewCustomFolder && _ctx.createNewCustomFolder(...args)), ["stop"])),
                      title: _ctx.t('nav.createFolder'),
                      "aria-label": _ctx.t('nav.createFolder'),
                      class: "grid h-5 w-5 place-items-center rounded text-[#c4d2f0] hover:bg-white/[0.1] hover:text-white"
                    }, _hoisted_93, 8 /* PROPS */, _hoisted_91)
                  ])
                ]),
                _withDirectives(_createElementVNode("div", null, [
                  (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(_ctx.allFolders, (fld) => {
                    return (_openBlock(), _createElementBlock("button", {
                      key: fld.id,
                      onClick: $event => (_ctx.setFilter('all', 'all', fld.id)),
                      class: _normalizeClass(['mb-0.5 flex h-8.5 w-full items-center gap-3 rounded-lg px-3 py-1.5 text-left text-[11.5px] transition-colors', (_ctx.currentFolder === fld.id && _ctx.rightPaneMode === 'item') ? 'bg-[#496fe8] font-semibold text-white shadow-[0_5px_18px_rgba(56,91,207,0.28)]' : 'text-[#d3def8] hover:bg-white/[0.09]'])
                    }, [
                      _createElementVNode("span", {
                        class: _normalizeClass(['grid h-6 w-6 shrink-0 place-items-center rounded-md', fld.tintClass])
                      }, [
                        _createElementVNode("i", {
                          class: _normalizeClass([fld.icon, 'text-[11px]'])
                        }, null, 2 /* CLASS */)
                      ], 2 /* CLASS */),
                      _createElementVNode("span", _hoisted_95, _toDisplayString(fld.name), 1 /* TEXT */),
                      _createElementVNode("span", _hoisted_96, _toDisplayString(_ctx.countByFolder(fld.id)), 1 /* TEXT */)
                    ], 10 /* CLASS, PROPS */, _hoisted_94))
                  }), 128 /* KEYED_FRAGMENT */))
                ], 512 /* NEED_PATCH */), [
                  [_vShow, _ctx.navSections.folders]
                ])
              ]),
              _createElementVNode("div", _hoisted_97, [
                _createElementVNode("div", {
                  class: "mb-2 flex items-center justify-between px-3 cursor-pointer",
                  onClick: _cache[36] || (_cache[36] = $event => (_ctx.toggleNavSection('tools')))
                }, [
                  _createElementVNode("span", _hoisted_98, _toDisplayString(_ctx.t('nav.tools')), 1 /* TEXT */),
                  _createElementVNode("i", {
                    class: "fa-solid fa-chevron-down text-[9px] text-[#93a8d7]",
                    style: _normalizeStyle({transform: _ctx.navSections.tools ? 'rotate(0deg)' : 'rotate(-90deg)'})
                  }, null, 4 /* STYLE */)
                ]),
                _withDirectives(_createElementVNode("div", _hoisted_99, [
                  _createElementVNode("button", {
                    onClick: _cache[37] || (_cache[37] = $event => (_ctx.setFilter('all', 'card', 'all'))),
                    class: _normalizeClass(['flex h-8.5 w-full items-center gap-3 rounded-lg px-3 py-1.5 text-left text-[11.5px] transition-colors', (_ctx.currentCategory === 'card' && _ctx.rightPaneMode === 'item') ? 'bg-[#496fe8] font-semibold text-white' : 'text-[#d3def8] hover:bg-white/[0.09]'])
                  }, [
                    _hoisted_100,
                    _createElementVNode("span", _hoisted_101, _toDisplayString(_ctx.t('nav.cards')), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_102, _toDisplayString(_ctx.countByCategory('card')), 1 /* TEXT */)
                  ], 2 /* CLASS */),
                  _createElementVNode("button", {
                    onClick: _cache[38] || (_cache[38] = $event => (_ctx.setFilter('all', 'discount', 'all'))),
                    class: _normalizeClass(['flex h-8.5 w-full items-center gap-3 rounded-lg px-3 py-1.5 text-left text-[11.5px] transition-colors', (_ctx.currentCategory === 'discount' && _ctx.rightPaneMode === 'item') ? 'bg-[#496fe8] font-semibold text-white' : 'text-[#d3def8] hover:bg-white/[0.09]'])
                  }, [
                    _hoisted_103,
                    _createElementVNode("span", _hoisted_104, _toDisplayString(_ctx.t('nav.discount')), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_105, _toDisplayString(_ctx.countByCategory('discount')), 1 /* TEXT */)
                  ], 2 /* CLASS */),
                  _createElementVNode("button", {
                    onClick: _cache[39] || (_cache[39] = $event => (_ctx.setFilter('all', 'note', 'all'))),
                    class: _normalizeClass(['flex h-8.5 w-full items-center gap-3 rounded-lg px-3 py-1.5 text-left text-[11.5px] transition-colors', (_ctx.currentCategory === 'note' && _ctx.rightPaneMode === 'item') ? 'bg-[#496fe8] font-semibold text-white' : 'text-[#d3def8] hover:bg-white/[0.09]'])
                  }, [
                    _hoisted_106,
                    _createElementVNode("span", _hoisted_107, _toDisplayString(_ctx.t('nav.notes')), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_108, _toDisplayString(_ctx.countByCategory('note')), 1 /* TEXT */)
                  ], 2 /* CLASS */),
                  _createElementVNode("button", {
                    onClick: _cache[40] || (_cache[40] = $event => (_ctx.setFilter('all', 'wifi', 'all'))),
                    class: _normalizeClass(['flex h-8.5 w-full items-center gap-3 rounded-lg px-3 py-1.5 text-left text-[11.5px] transition-colors', (_ctx.currentCategory === 'wifi' && _ctx.rightPaneMode === 'item') ? 'bg-[#496fe8] font-semibold text-white' : 'text-[#d3def8] hover:bg-white/[0.09]'])
                  }, [
                    _hoisted_109,
                    _createElementVNode("span", _hoisted_110, _toDisplayString(_ctx.t('nav.wifi')), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_111, _toDisplayString(_ctx.countByCategory('wifi')), 1 /* TEXT */)
                  ], 2 /* CLASS */),
                  _createElementVNode("button", {
                    onClick: _cache[41] || (_cache[41] = $event => (_ctx.openFullPageMode('totp_hub'))),
                    class: _normalizeClass(['flex h-8.5 w-full items-center gap-3 rounded-lg px-3 py-1.5 text-left text-[11.5px] transition-colors', _ctx.rightPaneMode === 'totp_hub' ? 'bg-[#496fe8] font-semibold text-white' : 'text-[#d3def8] hover:bg-white/[0.09]'])
                  }, [
                    _hoisted_112,
                    _createElementVNode("span", _hoisted_113, _toDisplayString(_ctx.t('nav.totp')), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_114, _toDisplayString(_ctx.itemsWithTotp.length), 1 /* TEXT */)
                  ], 2 /* CLASS */),
                  _createElementVNode("button", {
                    onClick: _cache[42] || (_cache[42] = (...args) => (_ctx.openDuplicatesView && _ctx.openDuplicatesView(...args))),
                    class: _normalizeClass(['flex h-8.5 w-full items-center gap-3 rounded-lg px-3 py-1.5 text-left text-[11.5px] transition-colors', _ctx.rightPaneMode === 'duplicates' ? 'bg-[#496fe8] font-semibold text-white' : 'text-[#d3def8] hover:bg-white/[0.09]'])
                  }, [
                    _hoisted_115,
                    _createElementVNode("span", _hoisted_116, _toDisplayString(_ctx.t('nav.duplicates')), 1 /* TEXT */),
                    (_ctx.duplicateGroups.length > 0)
                      ? (_openBlock(), _createElementBlock("span", _hoisted_117, _toDisplayString(_ctx.duplicateGroups.length), 1 /* TEXT */))
                      : _createCommentVNode("v-if", true)
                  ], 2 /* CLASS */),
                  _createElementVNode("button", {
                    onClick: _cache[43] || (_cache[43] = (...args) => (_ctx.openWatchtowerDashboard && _ctx.openWatchtowerDashboard(...args))),
                    class: _normalizeClass(['flex h-8.5 w-full items-center gap-3 rounded-lg px-3 py-1.5 text-left text-[11.5px] transition-colors', _ctx.rightPaneMode === 'watchtower' ? 'bg-[#496fe8] font-semibold text-white' : 'text-[#d3def8] hover:bg-white/[0.09]'])
                  }, [
                    _hoisted_118,
                    _createElementVNode("span", _hoisted_119, _toDisplayString(_ctx.t('nav.watchtower')), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_120, _toDisplayString(_ctx.securityScore) + "%", 1 /* TEXT */)
                  ], 2 /* CLASS */),
                  _createElementVNode("button", {
                    onClick: _cache[44] || (_cache[44] = $event => (_ctx.setFilter('all', 'trash', 'all'))),
                    class: _normalizeClass(['flex h-8.5 w-full items-center gap-3 rounded-lg px-3 py-1.5 text-left text-[11.5px] transition-colors', (_ctx.currentCategory === 'trash' && _ctx.rightPaneMode === 'item') ? 'bg-[#496fe8] font-semibold text-white' : 'text-[#d3def8] hover:bg-white/[0.09]'])
                  }, [
                    _hoisted_121,
                    _createElementVNode("span", _hoisted_122, _toDisplayString(_ctx.t('nav.trash')), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_123, _toDisplayString(_ctx.trashedItems.length), 1 /* TEXT */)
                  ], 2 /* CLASS */)
                ], 512 /* NEED_PATCH */), [
                  [_vShow, _ctx.navSections.tools]
                ])
              ]),
              _createElementVNode("div", _hoisted_124, [
                _createElementVNode("div", {
                  class: _normalizeClass(['rounded-xl border p-3', _ctx.theme === 'dark' ? 'border-[#405177] bg-[#202e4c]' : 'border-[#556b99] bg-[#29416c]'])
                }, [
                  _createElementVNode("div", _hoisted_125, [
                    _hoisted_126,
                    _createElementVNode("div", _hoisted_127, _toDisplayString(_ctx.t('nav.protectedUser', { user: _ctx.displayUsername })), 1 /* TEXT */)
                  ]),
                  _createElementVNode("div", _hoisted_128, [
                    _createElementVNode("p", _hoisted_129, _toDisplayString(_ctx.t('nav.autoLockIn')), 1 /* TEXT */),
                    _createElementVNode("span", {
                      class: _normalizeClass(['rounded-md px-2 py-0.5 font-mono text-[12px] font-bold tabular-nums', _ctx.idleSecondsLeft <= 60 ? 'bg-[#e11d48]/25 text-[#ffb3c1]' : 'bg-white/10 text-[#a8edcf]'])
                    }, _toDisplayString(_ctx.idleLabel), 3 /* TEXT, CLASS */)
                  ])
                ], 2 /* CLASS */),
                _createElementVNode("button", {
                  onClick: _cache[45] || (_cache[45] = (...args) => (_ctx.openHomeOverview && _ctx.openHomeOverview(...args))),
                  class: "mt-2 flex h-9 w-full items-center gap-2.5 rounded-lg px-3 text-left text-[11px] text-[#c4d2f0] transition hover:bg-white/[0.08] hover:text-white"
                }, [
                  _hoisted_130,
                  _createTextVNode(" " + _toDisplayString(_ctx.t('nav.settings')) + " ", 1 /* TEXT */),
                  _hoisted_131
                ])
              ])
            ], 2 /* CLASS */),
            _createElementVNode("main", _hoisted_132, [
              _createElementVNode("header", {
                class: _normalizeClass(['safe-top-header flex shrink-0 items-center justify-between border-b px-3.5 sm:px-8 pb-2.5 gap-2', _ctx.theme === 'dark' ? 'border-[#283653] bg-[#18243d]' : 'border-[#dbe2f6] bg-[#fbfcff]'])
              }, [
                _createElementVNode("div", _hoisted_133, [
                  _createElementVNode("button", {
                    onClick: _cache[46] || (_cache[46] = $event => (_ctx.mobileNavOpen = true)),
                    class: "grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#315bd7] text-white shadow-sm lg:hidden",
                    title: _ctx.t('header.menu'),
                    "aria-label": _ctx.t('header.menu')
                  }, _hoisted_136, 8 /* PROPS */, _hoisted_134),
                  _createElementVNode("div", _hoisted_137, [
                    _createElementVNode("i", {
                      class: _normalizeClass(['fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-xs', _ctx.theme === 'dark' ? 'text-[#91a2ca]' : 'text-[#7383ab]'])
                    }, null, 2 /* CLASS */),
                    _withDirectives(_createElementVNode("input", {
                      ref: "searchInputRef",
                      "onUpdate:modelValue": _cache[47] || (_cache[47] = $event => ((_ctx.searchQuery) = $event)),
                      onInput: _cache[48] || (_cache[48] = (...args) => (_ctx.onSearchInput && _ctx.onSearchInput(...args))),
                      onKeydown: _cache[49] || (_cache[49] = _withKeys($event => (_ctx.searchQuery = ''), ["esc"])),
                      placeholder: _ctx.t('header.search'),
                      "aria-label": _ctx.t('header.search'),
                      class: _normalizeClass(['h-9 sm:h-10 w-full rounded-lg border pl-8 pr-8 text-[13px] outline-none transition focus:border-[#6d8df0]', _ctx.theme === 'dark' ? 'border-[#364768] bg-[#202d49] text-[#eef1ff] placeholder:text-[#91a0c0]' : 'border-[#d8e0f3] bg-white text-[#26375e] placeholder:text-[#8997b7]'])
                    }, null, 42 /* CLASS, PROPS, HYDRATE_EVENTS */, _hoisted_138), [
                      [_vModelText, _ctx.searchQuery]
                    ]),
                    (_ctx.searchQuery)
                      ? (_openBlock(), _createElementBlock("button", {
                          key: 0,
                          onClick: _cache[50] || (_cache[50] = $event => {_ctx.searchQuery = ''; _ctx.selectedItem = null}),
                          "aria-label": _ctx.t('header.clearSearch'),
                          class: "absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8291b6]"
                        }, _hoisted_141, 8 /* PROPS */, _hoisted_139))
                      : (_openBlock(), _createElementBlock("span", {
                          key: 1,
                          class: _normalizeClass(['hidden sm:inline absolute right-2.5 top-1/2 -translate-y-1/2 rounded border px-1.5 py-0.5 text-[9px] font-mono', _ctx.theme === 'dark' ? 'border-[#425579] text-[#a7b5d6]' : 'border-[#dce3f3] text-[#8291b6]'])
                        }, "⌘ K", 2 /* CLASS */))
                  ])
                ]),
                _createElementVNode("div", _hoisted_142, [
                  (_ctx.sessionToken === 'OFFLINE_MODE')
                    ? (_openBlock(), _createElementBlock("div", {
                        key: 0,
                        class: "hidden sm:flex h-9 items-center gap-1.5 rounded-lg border border-[#f59e0b]/50 bg-[#f59e0b]/10 px-2.5 text-[10.5px] font-semibold text-[#b9770e] dark:text-[#f5cf73]",
                        title: _ctx.t('header.offlineHint')
                      }, [
                        _hoisted_144,
                        _createTextVNode(" " + _toDisplayString(_ctx.t('header.offline')), 1 /* TEXT */)
                      ], 8 /* PROPS */, _hoisted_143))
                    : _createCommentVNode("v-if", true),
                  _createElementVNode("div", {
                    class: _normalizeClass(['flex h-9 items-center gap-1.5 rounded-lg border px-2 sm:px-2.5 font-mono text-[11px] font-semibold tabular-nums transition', _ctx.idleSecondsLeft <= 60 ? 'border-[#e11d48]/60 bg-[#e11d48]/10 text-[#e11d48]' : (_ctx.theme === 'dark' ? 'border-[#3b4c6f] bg-[#202d49] text-[#91d2ff]' : 'border-[#d8e0f3] bg-white text-[#536ca7]')]),
                    title: _ctx.t('header.idleHint')
                  }, [
                    _hoisted_146,
                    _createTextVNode(" " + _toDisplayString(_ctx.idleLabel), 1 /* TEXT */)
                  ], 10 /* CLASS, PROPS */, _hoisted_145),
                  _createElementVNode("button", {
                    onClick: _cache[51] || (_cache[51] = $event => (_ctx.refreshVault())),
                    title: _ctx.t('header.refresh'),
                    "aria-label": _ctx.t('header.refresh'),
                    class: _normalizeClass(['grid h-9 w-9 place-items-center rounded-lg border transition', _ctx.theme === 'dark' ? 'border-[#3b4c6f] bg-[#202d49] text-[#91d2ff]' : 'border-[#d8e0f3] bg-white text-[#536ca7]'])
                  }, _hoisted_149, 10 /* CLASS, PROPS */, _hoisted_147),
                  _createElementVNode("button", {
                    onClick: _cache[52] || (_cache[52] = $event => (_ctx.setTheme(_ctx.theme === 'dark' ? 'light' : 'dark'))),
                    title: _ctx.t('common.theme'),
                    "aria-label": _ctx.t('common.theme'),
                    class: _normalizeClass(['grid h-9 w-9 place-items-center rounded-lg border transition', _ctx.theme === 'dark' ? 'border-[#3b4c6f] bg-[#202d49] text-[#f5cf73]' : 'border-[#d8e0f3] bg-white text-[#536ca7]'])
                  }, [
                    _createElementVNode("i", {
                      class: _normalizeClass(_ctx.theme === 'dark' ? 'fa-solid fa-sun text-xs' : 'fa-solid fa-moon text-xs')
                    }, null, 2 /* CLASS */)
                  ], 10 /* CLASS, PROPS */, _hoisted_150),
                  _createElementVNode("button", {
                    onClick: _cache[53] || (_cache[53] = $event => (_ctx.openItemModal(null))),
                    class: "hidden sm:flex h-9 items-center gap-2 rounded-lg bg-[#315bd7] px-3.5 text-[11.5px] font-semibold text-white shadow-sm hover:bg-[#264cc4]"
                  }, [
                    _hoisted_151,
                    _createTextVNode(),
                    _createElementVNode("span", null, _toDisplayString(_ctx.t('item.new')), 1 /* TEXT */)
                  ]),
                  _createElementVNode("button", {
                    onClick: _cache[54] || (_cache[54] = $event => (_ctx.handleLogout(false))),
                    title: _ctx.t('header.logout'),
                    "aria-label": _ctx.t('header.logout'),
                    class: _normalizeClass(['grid h-9 w-9 place-items-center rounded-lg border transition hover:text-[#e11d48]', _ctx.theme === 'dark' ? 'border-[#3b4c6f] bg-[#202d49] text-[#f3a7c4]' : 'border-[#d8e0f3] bg-white text-[#7180a0]'])
                  }, _hoisted_154, 10 /* CLASS, PROPS */, _hoisted_152)
                ])
              ], 2 /* CLASS */),
              _createElementVNode("div", _hoisted_155, [
                _createElementVNode("div", _hoisted_156, [
                  _createElementVNode("div", _hoisted_157, [
                    _createElementVNode("div", _hoisted_158, [
                      _createElementVNode("span", {
                        class: "cursor-pointer hover:underline",
                        onClick: _cache[55] || (_cache[55] = $event => (_ctx.setFilter('all', 'all', 'all')))
                      }, _toDisplayString(_ctx.t('title.vault')), 1 /* TEXT */),
                      _hoisted_159,
                      _createElementVNode("span", _hoisted_160, _toDisplayString(_ctx.rightPaneMode === 'item' ? _ctx.currentTitle : _ctx.rightPaneTitle), 1 /* TEXT */)
                    ]),
                    _createElementVNode("h1", _hoisted_161, _toDisplayString(_ctx.rightPaneMode === 'item' ? (_ctx.currentCategory === 'all' && _ctx.currentFolder === 'all' ? _ctx.t('title.yourCredentials') : _ctx.currentTitle) : _ctx.rightPaneTitle), 1 /* TEXT */)
                  ]),
                  (_ctx.rightPaneMode === 'item')
                    ? (_openBlock(), _createElementBlock("div", _hoisted_162, [
                        _createElementVNode("button", {
                          onClick: _cache[56] || (_cache[56] = (...args) => (_ctx.toggleMultiSelectMode && _ctx.toggleMultiSelectMode(...args))),
                          class: _normalizeClass(['flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[10.5px] font-medium transition', _ctx.multiSelectMode ? 'border-[#315bd7] bg-[#315bd7] text-white' : (_ctx.theme === 'dark' ? 'border-[#39496a] bg-[#1d2a46] text-[#ccd7f3]' : 'border-[#d9e1f4] bg-[#f9faff] text-[#52678e]')])
                        }, [
                          _hoisted_163,
                          _createTextVNode(" " + _toDisplayString(_ctx.multiSelectMode ? _ctx.t('common.cancel') : _ctx.t('list.merge')), 1 /* TEXT */)
                        ], 2 /* CLASS */),
                        _createElementVNode("button", {
                          onClick: _cache[57] || (_cache[57] = $event => (_ctx.sortBy = _ctx.sortBy === 'alpha' ? 'recent' : 'alpha')),
                          class: _normalizeClass(['flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[10.5px] transition', _ctx.theme === 'dark' ? 'border-[#39496a] bg-[#1d2a46] text-[#ccd7f3]' : 'border-[#d9e1f4] bg-[#f9faff] text-[#52678e]'])
                        }, [
                          _hoisted_164,
                          _createTextVNode(" " + _toDisplayString(_ctx.sortBy === 'alpha' ? _ctx.t('list.sortAlpha') : _ctx.t('list.sortDate')), 1 /* TEXT */)
                        ], 2 /* CLASS */)
                      ]))
                    : (_openBlock(), _createElementBlock("div", _hoisted_165, [
                        _createElementVNode("button", {
                          onClick: _cache[58] || (_cache[58] = $event => (_ctx.setFilter('all', 'all', 'all'))),
                          class: "flex h-8 items-center gap-1.5 rounded-lg bg-[#315bd7] px-3 text-[11px] font-semibold text-white"
                        }, [
                          _hoisted_166,
                          _createTextVNode(" " + _toDisplayString(_ctx.t('list.backToList')), 1 /* TEXT */)
                        ])
                      ]))
                ])
              ]),
              (_ctx.rightPaneMode === 'item')
                ? (_openBlock(), _createElementBlock("div", _hoisted_167, [
                    _createElementVNode("section", {
                      class: _normalizeClass(['flex min-h-0 flex-col overflow-hidden rounded-xl border shadow-[0_12px_36px_rgba(38,61,120,0.055)]', _ctx.theme === 'dark' ? 'border-[#324260] bg-[#1a2741]' : 'border-[#dce3f4] bg-[#fffefa]', _ctx.selectedItem ? 'hidden xl:flex' : 'flex'])
                    }, [
                      _createElementVNode("div", {
                        class: _normalizeClass(['flex h-[42px] shrink-0 items-center justify-between border-b px-3.5', _ctx.theme === 'dark' ? 'border-[#324260]' : 'border-[#e7ebf5]'])
                      }, [
                        _createElementVNode("div", _hoisted_168, _toDisplayString(_ctx.t('list.count', { n: _ctx.filteredItems.length })), 1 /* TEXT */),
                        (_ctx.searchQuery || _ctx.currentFolder !== 'all' || _ctx.currentCategory !== 'all')
                          ? (_openBlock(), _createElementBlock("button", {
                              key: 0,
                              onClick: _cache[59] || (_cache[59] = (...args) => (_ctx.resetAllFilters && _ctx.resetAllFilters(...args))),
                              class: "text-[10.5px] font-semibold text-[#315bd7] dark:text-[#91d2ff]"
                            }, _toDisplayString(_ctx.t('list.reset')), 1 /* TEXT */))
                          : (_ctx.currentCategory === 'trash' && _ctx.trashedItems.length > 0)
                            ? (_openBlock(), _createElementBlock("button", {
                                key: 1,
                                onClick: _cache[60] || (_cache[60] = (...args) => (_ctx.emptyTrashAll && _ctx.emptyTrashAll(...args))),
                                class: "text-[10.5px] font-semibold text-[#e11d48]"
                              }, _toDisplayString(_ctx.t('trash.empty')), 1 /* TEXT */))
                            : _createCommentVNode("v-if", true)
                      ], 2 /* CLASS */),
                      (_ctx.multiSelectMode)
                        ? (_openBlock(), _createElementBlock("div", _hoisted_169, [
                            _createElementVNode("span", _hoisted_170, _toDisplayString(_ctx.t('list.selected', { n: _ctx.manualSelectedIds.length })), 1 /* TEXT */),
                            (_ctx.manualSelectedIds.length >= 2)
                              ? (_openBlock(), _createElementBlock("div", _hoisted_171, [
                                  _createElementVNode("button", {
                                    onClick: _cache[61] || (_cache[61] = (...args) => (_ctx.mergeManualSelectedAsMultiCard && _ctx.mergeManualSelectedAsMultiCard(...args))),
                                    class: "rounded-md bg-[#315bd7] px-2.5 py-1 text-[10px] font-semibold text-white"
                                  }, _toDisplayString(_ctx.t('merge.toMulti')), 1 /* TEXT */),
                                  _createElementVNode("button", {
                                    onClick: _cache[62] || (_cache[62] = (...args) => (_ctx.mergeManualSelectedIntoOne && _ctx.mergeManualSelectedIntoOne(...args))),
                                    class: "rounded-md border border-[#315bd7] px-2 py-1 text-[10px] font-semibold text-[#315bd7] dark:text-[#91d2ff]"
                                  }, _toDisplayString(_ctx.t('merge.toOne')), 1 /* TEXT */)
                                ]))
                              : _createCommentVNode("v-if", true)
                          ]))
                        : _createCommentVNode("v-if", true),
                      _createElementVNode("div", _hoisted_172, [
                        (_ctx.filteredItems.length > 0)
                          ? (_openBlock(true), _createElementBlock(_Fragment, { key: 0 }, _renderList(_ctx.filteredItems, (item) => {
                              return (_openBlock(), _createElementBlock("button", {
                                key: item.id,
                                onClick: $event => (_ctx.multiSelectMode ? _ctx.toggleManualSelectId(item.id) : _ctx.selectItemCard(item)),
                                class: _normalizeClass([
                                                'group mb-1 flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors',
                                                (_ctx.selectedItem && _ctx.selectedItem.id === item.id)
                                                    ? (_ctx.theme === 'dark' ? 'bg-[#2a3b5e] ring-1 ring-inset ring-[#536ea6]' : 'bg-[#e9efff] ring-1 ring-inset ring-[#c4d2fb]')
                                                    : 'hover:bg-[#f1f4fc] dark:hover:bg-white/[0.04]'
                                            ])
                              }, [
                                (_ctx.multiSelectMode)
                                  ? (_openBlock(), _createElementBlock("input", {
                                      key: 0,
                                      type: "checkbox",
                                      checked: _ctx.manualSelectedIds.includes(item.id),
                                      onClick: _withModifiers($event => (_ctx.toggleManualSelectId(item.id)), ["stop"]),
                                      class: "h-4 w-4 shrink-0 accent-[#315bd7]"
                                    }, null, 8 /* PROPS */, _hoisted_174))
                                  : _createCommentVNode("v-if", true),
                                _createElementVNode("span", {
                                  class: "relative grid h-9 w-9 shrink-0 place-items-center rounded-[11px] text-[13px] font-semibold text-white shadow-sm overflow-hidden",
                                  style: _normalizeStyle({ backgroundColor: _ctx.getEntryColorHex(item.decrypted.title) })
                                }, [
                                  (item.decrypted.itemType === 'note')
                                    ? (_openBlock(), _createElementBlock("i", _hoisted_175))
                                    : (item.decrypted.itemType === 'card')
                                      ? (_openBlock(), _createElementBlock("i", _hoisted_176))
                                      : (item.decrypted.itemType === 'discount')
                                        ? (_openBlock(), _createElementBlock("i", _hoisted_177))
                                        : (item.decrypted.itemType === 'wifi')
                                          ? (_openBlock(), _createElementBlock("i", _hoisted_178))
                                          : (_openBlock(), _createElementBlock(_Fragment, { key: 4 }, [
                                              _createElementVNode("span", null, _toDisplayString(_ctx.getInitials(_ctx.decodePunycodeText(item.decrypted.title))), 1 /* TEXT */),
                                              (_ctx.getFaviconUrl(item.decrypted) && !item.badFavicon)
                                                ? (_openBlock(), _createElementBlock("img", {
                                                    key: 0,
                                                    src: _ctx.getFaviconUrl(item.decrypted),
                                                    class: "absolute inset-0 h-full w-full object-contain bg-white p-1 rounded-[11px]",
                                                    onLoad: $event => (_ctx.checkFaviconQuality($event, item)),
                                                    onError: $event => (item.badFavicon = true)
                                                  }, null, 40 /* PROPS, HYDRATE_EVENTS */, _hoisted_179))
                                                : _createCommentVNode("v-if", true)
                                            ], 64 /* STABLE_FRAGMENT */))
                                ], 4 /* STYLE */),
                                _createElementVNode("span", _hoisted_180, [
                                  _createElementVNode("span", _hoisted_181, [
                                    _createElementVNode("span", {
                                      class: _normalizeClass(['truncate text-[12.5px] font-semibold', _ctx.theme === 'dark' ? 'text-[#edf1ff]' : 'text-[#263756]'])
                                    }, _toDisplayString(_ctx.decodePunycodeText(item.decrypted.title)), 3 /* TEXT, CLASS */),
                                    (item.is_favorite)
                                      ? (_openBlock(), _createElementBlock("i", _hoisted_182))
                                      : _createCommentVNode("v-if", true),
                                    (item.decrypted.subCards && item.decrypted.subCards.length > 0)
                                      ? (_openBlock(), _createElementBlock("span", _hoisted_183, _toDisplayString(_ctx.tp('list.accounts', item.decrypted.subCards.length)), 1 /* TEXT */))
                                      : _createCommentVNode("v-if", true)
                                  ]),
                                  _createElementVNode("span", {
                                    class: _normalizeClass(['mt-0.5 block truncate text-[11px]', _ctx.theme === 'dark' ? 'text-[#a8b7d4]' : 'text-[#7182a6]'])
                                  }, _toDisplayString(item.decrypted.itemType === 'note' ? (item.decrypted.note || _ctx.t('list.textNote')).substring(0, 35) : (item.decrypted.username || _ctx.formatDomain(item.decrypted.url))), 3 /* TEXT, CLASS */)
                                ]),
                                _hoisted_184
                              ], 10 /* CLASS, PROPS */, _hoisted_173))
                            }), 128 /* KEYED_FRAGMENT */))
                          : (_openBlock(), _createElementBlock("div", _hoisted_185, [
                              _createElementVNode("p", _hoisted_186, _toDisplayString(_ctx.t('list.empty')), 1 /* TEXT */),
                              _createElementVNode("button", {
                                onClick: _cache[63] || (_cache[63] = (...args) => (_ctx.resetAllFilters && _ctx.resetAllFilters(...args))),
                                class: "mt-2 rounded-md px-3 py-1.5 text-[11px] font-semibold text-[#315bd7] dark:text-[#b9c9ff]"
                              }, _toDisplayString(_ctx.t('list.showAll')), 1 /* TEXT */)
                            ]))
                      ])
                    ], 2 /* CLASS */),
                    (_ctx.selectedItem)
                      ? (_openBlock(), _createElementBlock("section", {
                          key: 0,
                          class: _normalizeClass(['min-w-0 min-h-0 flex flex-col overflow-y-auto rounded-xl border shadow-[0_12px_36px_rgba(38,61,120,0.055)]', _ctx.theme === 'dark' ? 'border-[#324260] bg-[#1a2741]' : 'border-[#dce3f4] bg-[#fffefa]'])
                        }, [
                          _createElementVNode("div", {
                            class: _normalizeClass(["xl:hidden sticky top-0 z-20 flex items-center justify-between border-b px-4 py-2.5 backdrop-blur-md", _ctx.theme === 'dark' ? 'border-[#324260] bg-[#1a2741]/95' : 'border-[#e7ebf5] bg-[#fffefa]/95'])
                          }, [
                            _createElementVNode("button", {
                              onClick: _cache[64] || (_cache[64] = $event => (_ctx.selectedItem = null)),
                              class: "flex items-center gap-2 text-xs font-bold text-[#315bd7] dark:text-[#91d2ff] py-1"
                            }, [
                              _hoisted_187,
                              _createTextVNode(" " + _toDisplayString(_ctx.t('list.backToList')), 1 /* TEXT */)
                            ]),
                            _createElementVNode("div", _hoisted_188, [
                              _createElementVNode("button", {
                                onClick: _cache[65] || (_cache[65] = $event => (_ctx.toggleFavorite(_ctx.selectedItem))),
                                title: _ctx.t('nav.favorites'),
                                "aria-label": _ctx.t('nav.favorites'),
                                class: _normalizeClass(["h-8 w-8 rounded-lg border grid place-items-center", _ctx.theme === 'dark' ? 'border-[#46577a] bg-[#283757]' : 'border-[#e2e7f3] bg-white'])
                              }, [
                                _createElementVNode("i", {
                                  class: _normalizeClass([_ctx.selectedItem.is_favorite ? 'fa-solid text-[#d99822]' : 'fa-regular', 'fa-star text-xs'])
                                }, null, 2 /* CLASS */)
                              ], 10 /* CLASS, PROPS */, _hoisted_189),
                              _createElementVNode("button", {
                                onClick: _cache[66] || (_cache[66] = $event => (_ctx.openItemModal(_ctx.selectedItem))),
                                class: _normalizeClass(["h-8 rounded-lg border px-2.5 text-[11px] font-semibold", _ctx.theme === 'dark' ? 'border-[#46577a] bg-[#283757]' : 'border-[#e2e7f3] bg-white'])
                              }, _toDisplayString(_ctx.t('item.edit')), 3 /* TEXT, CLASS */),
                              (!_ctx.selectedItem.is_trashed)
                                ? (_openBlock(), _createElementBlock("button", {
                                    key: 0,
                                    onClick: _cache[67] || (_cache[67] = $event => (_ctx.moveToTrash(_ctx.selectedItem))),
                                    title: _ctx.t('trash.move'),
                                    "aria-label": _ctx.t('trash.move'),
                                    class: _normalizeClass(["h-8 w-8 rounded-lg border grid place-items-center text-[#e11d48]", _ctx.theme === 'dark' ? 'border-[#46577a] bg-[#283757]' : 'border-[#e2e7f3] bg-white'])
                                  }, _hoisted_192, 10 /* CLASS, PROPS */, _hoisted_190))
                                : (_openBlock(), _createElementBlock(_Fragment, { key: 1 }, [
                                    _createElementVNode("button", {
                                      onClick: _cache[68] || (_cache[68] = $event => (_ctx.restoreFromTrash(_ctx.selectedItem))),
                                      class: "h-8 rounded-lg bg-[#10b981] px-2.5 text-[10.5px] font-semibold text-white"
                                    }, _toDisplayString(_ctx.t('trash.restoreShort')), 1 /* TEXT */),
                                    _createElementVNode("button", {
                                      onClick: _cache[69] || (_cache[69] = $event => (_ctx.deletePermanently(_ctx.selectedItem.id))),
                                      class: "h-8 rounded-lg bg-[#e11d48] px-2.5 text-[10.5px] font-semibold text-white"
                                    }, _toDisplayString(_ctx.t('trash.deleteShort')), 1 /* TEXT */)
                                  ], 64 /* STABLE_FRAGMENT */))
                            ])
                          ], 2 /* CLASS */),
                          _createElementVNode("div", {
                            class: _normalizeClass(['flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3.5 sm:px-7', _ctx.theme === 'dark' ? 'border-[#324260] bg-[#202f4e]' : 'border-[#f0f3fc] bg-[#f7f9ff]'])
                          }, [
                            _createElementVNode("div", _hoisted_193, [
                              _createElementVNode("div", {
                                class: "relative grid h-11 w-11 shrink-0 place-items-center rounded-[13px] text-[16px] font-semibold text-white shadow-sm overflow-hidden",
                                style: _normalizeStyle({ backgroundColor: _ctx.getEntryColorHex(_ctx.selectedItem.decrypted.title) })
                              }, [
                                (_ctx.selectedItem.decrypted.itemType === 'note')
                                  ? (_openBlock(), _createElementBlock("i", _hoisted_194))
                                  : (_ctx.selectedItem.decrypted.itemType === 'card')
                                    ? (_openBlock(), _createElementBlock("i", _hoisted_195))
                                    : (_ctx.selectedItem.decrypted.itemType === 'discount')
                                      ? (_openBlock(), _createElementBlock("i", _hoisted_196))
                                      : (_ctx.selectedItem.decrypted.itemType === 'wifi')
                                        ? (_openBlock(), _createElementBlock("i", _hoisted_197))
                                        : (_openBlock(), _createElementBlock(_Fragment, { key: 4 }, [
                                            _createElementVNode("span", null, _toDisplayString(_ctx.getInitials(_ctx.decodePunycodeText(_ctx.selectedItem.decrypted.title))), 1 /* TEXT */),
                                            (_ctx.getFaviconUrl(_ctx.selectedItem.decrypted) && !_ctx.selectedItem.badFavicon)
                                              ? (_openBlock(), _createElementBlock("img", {
                                                  key: 0,
                                                  src: _ctx.getFaviconUrl(_ctx.selectedItem.decrypted),
                                                  class: "absolute inset-0 h-full w-full object-contain bg-white p-1.5 rounded-[13px]",
                                                  onLoad: _cache[70] || (_cache[70] = $event => (_ctx.checkFaviconQuality($event, _ctx.selectedItem))),
                                                  onError: _cache[71] || (_cache[71] = $event => (_ctx.selectedItem.badFavicon = true))
                                                }, null, 40 /* PROPS, HYDRATE_EVENTS */, _hoisted_198))
                                              : _createCommentVNode("v-if", true)
                                          ], 64 /* STABLE_FRAGMENT */))
                              ], 4 /* STYLE */),
                              _createElementVNode("div", _hoisted_199, [
                                _createElementVNode("div", _hoisted_200, [
                                  _createElementVNode("h2", _hoisted_201, _toDisplayString(_ctx.decodePunycodeText(_ctx.selectedItem.decrypted.title)), 1 /* TEXT */),
                                  _createElementVNode("select", {
                                    value: _ctx.getItemFolderId(_ctx.selectedItem),
                                    onChange: _cache[72] || (_cache[72] = $event => (_ctx.quickAssignFolder(_ctx.selectedItem, $event.target.value))),
                                    class: _normalizeClass(['rounded-full px-2.5 py-0.5 text-[10px] font-medium outline-none cursor-pointer border-none', _ctx.theme === 'dark' ? 'bg-[#35466a] text-[#d5deff]' : 'bg-[#e9edff] text-[#4963b0]'])
                                  }, [
                                    _createElementVNode("option", _hoisted_203, _toDisplayString(_ctx.t('item.noFolder')), 1 /* TEXT */),
                                    (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(_ctx.allFolders, (f) => {
                                      return (_openBlock(), _createElementBlock("option", {
                                        key: f.id,
                                        value: f.id
                                      }, _toDisplayString(f.name), 9 /* TEXT, PROPS */, _hoisted_204))
                                    }), 128 /* KEYED_FRAGMENT */))
                                  ], 42 /* CLASS, PROPS, HYDRATE_EVENTS */, _hoisted_202)
                                ]),
                                _createElementVNode("div", {
                                  class: _normalizeClass(['mt-0.5 text-[10px]', _ctx.theme === 'dark' ? 'text-[#a7b5d2]' : 'text-[#8492b2]'])
                                }, _toDisplayString(_ctx.t('item.updated', { date: _ctx.formatTimestamp(_ctx.selectedItem.updated_at) })), 3 /* TEXT, CLASS */)
                              ])
                            ]),
                            _createElementVNode("div", _hoisted_205, [
                              _createElementVNode("button", {
                                onClick: _cache[73] || (_cache[73] = $event => (_ctx.toggleFavorite(_ctx.selectedItem))),
                                title: _ctx.t('nav.favorites'),
                                "aria-label": _ctx.t('nav.favorites'),
                                class: _normalizeClass(['grid h-8 w-8 place-items-center rounded-lg border transition', _ctx.theme === 'dark' ? 'border-[#46577a] bg-[#283757] text-[#f4ca66]' : 'border-[#e2e7f3] bg-white text-[#6478ae]'])
                              }, [
                                _createElementVNode("i", {
                                  class: _normalizeClass([_ctx.selectedItem.is_favorite ? 'fa-solid text-[#d99822]' : 'fa-regular', 'fa-star text-xs'])
                                }, null, 2 /* CLASS */)
                              ], 10 /* CLASS, PROPS */, _hoisted_206),
                              _createElementVNode("button", {
                                onClick: _cache[74] || (_cache[74] = $event => (_ctx.startMergeFromCurrentItem(_ctx.selectedItem))),
                                class: _normalizeClass(['h-8 rounded-lg border px-2.5 text-[10.5px] font-semibold transition', _ctx.theme === 'dark' ? 'border-[#46577a] bg-[#283757] text-[#e0e7ff]' : 'border-[#e2e7f3] bg-white text-[#4c618f]'])
                              }, _toDisplayString(_ctx.t('merge.with')), 3 /* TEXT, CLASS */),
                              _createElementVNode("button", {
                                onClick: _cache[75] || (_cache[75] = $event => (_ctx.openItemModal(_ctx.selectedItem))),
                                class: _normalizeClass(['h-8 rounded-lg border px-3 text-[10.5px] font-semibold transition', _ctx.theme === 'dark' ? 'border-[#46577a] bg-[#283757] text-[#e0e7ff]' : 'border-[#e2e7f3] bg-white text-[#4c618f]'])
                              }, _toDisplayString(_ctx.t('item.editLong')), 3 /* TEXT, CLASS */),
                              (!_ctx.selectedItem.is_trashed)
                                ? (_openBlock(), _createElementBlock("button", {
                                    key: 0,
                                    onClick: _cache[76] || (_cache[76] = $event => (_ctx.moveToTrash(_ctx.selectedItem))),
                                    title: _ctx.t('trash.move'),
                                    "aria-label": _ctx.t('trash.move'),
                                    class: _normalizeClass(['grid h-8 w-8 place-items-center rounded-lg border transition hover:text-[#b6544a]', _ctx.theme === 'dark' ? 'border-[#46577a] bg-[#283757] text-[#b9c5e0]' : 'border-[#e2e7f3] bg-white text-[#7180a0]'])
                                  }, _hoisted_209, 10 /* CLASS, PROPS */, _hoisted_207))
                                : (_openBlock(), _createElementBlock(_Fragment, { key: 1 }, [
                                    _createElementVNode("button", {
                                      onClick: _cache[77] || (_cache[77] = $event => (_ctx.restoreFromTrash(_ctx.selectedItem))),
                                      class: "h-8 rounded-lg bg-[#10b981] px-3 text-[10.5px] font-semibold text-white"
                                    }, _toDisplayString(_ctx.t('trash.restore')), 1 /* TEXT */),
                                    _createElementVNode("button", {
                                      onClick: _cache[78] || (_cache[78] = $event => (_ctx.deletePermanently(_ctx.selectedItem.id))),
                                      class: "h-8 rounded-lg bg-[#e11d48] px-3 text-[10.5px] font-semibold text-white"
                                    }, _toDisplayString(_ctx.t('trash.deleteForever')), 1 /* TEXT */)
                                  ], 64 /* STABLE_FRAGMENT */))
                            ])
                          ], 2 /* CLASS */),
                          _createElementVNode("div", _hoisted_210, [
                            (_ctx.isMultiCard)
                              ? (_openBlock(), _createElementBlock("div", _hoisted_211, [
                                  _createElementVNode("div", _hoisted_212, [
                                    _createElementVNode("div", {
                                      class: _normalizeClass(["flex items-center gap-1.5 overflow-x-auto rounded-xl border p-1 max-w-full", _ctx.theme === 'dark' ? 'border-[#3a4b70] bg-[#202e4b]' : 'border-[#dfe5f3] bg-[#f8faff]'])
                                    }, [
                                      _createElementVNode("button", {
                                        onClick: _cache[79] || (_cache[79] = $event => (_ctx.subCardsViewAll = true)),
                                        class: _normalizeClass(['px-2.5 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition', _ctx.subCardsViewAll ? 'bg-[#315bd7] text-white' : 'opacity-75'])
                                      }, [
                                        _hoisted_213,
                                        _createTextVNode(_toDisplayString(_ctx.t('multi.all')), 1 /* TEXT */)
                                      ], 2 /* CLASS */),
                                      (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(_ctx.selectedItem.decrypted.subCards, (sc, sIdx) => {
                                        return (_openBlock(), _createElementBlock("button", {
                                          key: sIdx,
                                          onClick: $event => {_ctx.activeSubCardIdx = sIdx; _ctx.subCardsViewAll = false},
                                          class: _normalizeClass(['px-2.5 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition', (!_ctx.subCardsViewAll && _ctx.activeSubCardIdx === sIdx) ? 'bg-[#315bd7] text-white' : 'opacity-75'])
                                        }, " #" + _toDisplayString(sIdx + 1) + " " + _toDisplayString(_ctx.formatDomain(sc.url) || _ctx.decodePunycodeText(sc.title)), 11 /* TEXT, CLASS, PROPS */, _hoisted_214))
                                      }), 128 /* KEYED_FRAGMENT */))
                                    ], 2 /* CLASS */),
                                    _createElementVNode("button", {
                                      onClick: _cache[80] || (_cache[80] = $event => (_ctx.unmergeMultiCard(_ctx.selectedItem))),
                                      class: "text-[11px] font-semibold text-[#315bd7] dark:text-[#91d2ff] hover:underline"
                                    }, _toDisplayString(_ctx.t('merge.unmerge')), 1 /* TEXT */)
                                  ])
                                ]))
                              : _createCommentVNode("v-if", true),
                            (_ctx.showSingleView)
                              ? (_openBlock(), _createElementBlock(_Fragment, { key: 1 }, [
                                  (_ctx.selectedItem.decrypted.itemType === 'card')
                                    ? (_openBlock(), _createElementBlock("div", {
                                        key: 0,
                                        class: "relative mx-auto w-full max-w-[380px] overflow-hidden rounded-2xl p-5 text-white shadow-[0_18px_40px_rgba(20,36,74,0.28)]",
                                        style: _normalizeStyle({ background: 'linear-gradient(135deg, ' + _ctx.getEntryColorHex(_ctx.selectedItem.decrypted.title) + ' 0%, #121c36 100%)' })
                                      }, [
                                        _hoisted_215,
                                        _hoisted_216,
                                        _createElementVNode("div", _hoisted_217, [
                                          _createElementVNode("div", _hoisted_218, _toDisplayString(_ctx.decodePunycodeText(_ctx.selectedItem.decrypted.title)), 1 /* TEXT */),
                                          _createElementVNode("div", _hoisted_219, _toDisplayString(_ctx.detectCardBrand(_ctx.activeCardData.username)), 1 /* TEXT */)
                                        ]),
                                        _hoisted_220,
                                        _createElementVNode("div", {
                                          class: "relative mt-4 cursor-pointer break-all font-mono text-[17px] font-semibold tracking-[0.12em] sm:text-[19px]",
                                          onClick: _cache[81] || (_cache[81] = $event => (_ctx.copyText(_ctx.activeCardData.username, false))),
                                          title: _ctx.t('card.copyNumber')
                                        }, _toDisplayString(_ctx.formatCardNumber(_ctx.activeCardData.username)), 9 /* TEXT, PROPS */, _hoisted_221),
                                        _createElementVNode("div", _hoisted_222, [
                                          _createElementVNode("div", _hoisted_223, [
                                            _createElementVNode("div", _hoisted_224, _toDisplayString(_ctx.t('card.holder')), 1 /* TEXT */),
                                            _createElementVNode("div", _hoisted_225, _toDisplayString(_ctx.cardExtra.holder || '—'), 1 /* TEXT */)
                                          ]),
                                          _createElementVNode("div", null, [
                                            _createElementVNode("div", _hoisted_226, _toDisplayString(_ctx.t('card.expiry')), 1 /* TEXT */),
                                            _createElementVNode("div", _hoisted_227, _toDisplayString(_ctx.cardExtra.expiry || _ctx.t('card.expiryPlaceholder')), 1 /* TEXT */)
                                          ]),
                                          _createElementVNode("div", {
                                            class: "cursor-pointer",
                                            onClick: _cache[82] || (_cache[82] = $event => (_ctx.copyText(_ctx.activeCardData.password, true))),
                                            title: _ctx.t('card.copyCvv')
                                          }, [
                                            _hoisted_229,
                                            _createElementVNode("div", _hoisted_230, _toDisplayString(_ctx.selectedItem.showPwd ? (_ctx.activeCardData.password || '—') : '•••'), 1 /* TEXT */)
                                          ], 8 /* PROPS */, _hoisted_228)
                                        ])
                                      ], 4 /* STYLE */))
                                    : _createCommentVNode("v-if", true),
                                  (_ctx.selectedItem.decrypted.itemType === 'discount')
                                    ? (_openBlock(), _createElementBlock("div", _hoisted_231, [
                                        _createElementVNode("div", {
                                          class: "relative aspect-[1.586/1] w-full overflow-hidden rounded-2xl text-white shadow-[0_18px_40px_rgba(20,36,74,0.28)] ring-1 ring-black/10 dark:ring-white/10",
                                          style: _normalizeStyle(_ctx.discountExtra.photo ? { background: '#121c36' } : _ctx.discountCardStyle)
                                        }, [
                                          (_ctx.discountExtra.photo)
                                            ? (_openBlock(), _createElementBlock(_Fragment, { key: 0 }, [
                                                _createElementVNode("img", {
                                                  src: _ctx.discountExtra.photo,
                                                  alt: _ctx.t('item.discount.photoAlt'),
                                                  class: "absolute inset-0 h-full w-full object-cover",
                                                  draggable: "false"
                                                }, null, 8 /* PROPS */, _hoisted_232),
                                                _createElementVNode("div", _hoisted_233, [
                                                  _createElementVNode("div", _hoisted_234, _toDisplayString(_ctx.decodePunycodeText(_ctx.selectedItem.decrypted.title)), 1 /* TEXT */),
                                                  (_ctx.discountExtra.expiry)
                                                    ? (_openBlock(), _createElementBlock("div", _hoisted_235, _toDisplayString(_ctx.discountExtra.expiry), 1 /* TEXT */))
                                                    : _createCommentVNode("v-if", true)
                                                ])
                                              ], 64 /* STABLE_FRAGMENT */))
                                            : (_openBlock(), _createElementBlock(_Fragment, { key: 1 }, [
                                                _hoisted_236,
                                                _hoisted_237,
                                                _createElementVNode("div", _hoisted_238, [
                                                  _createElementVNode("div", _hoisted_239, [
                                                    _createElementVNode("div", _hoisted_240, _toDisplayString(_ctx.decodePunycodeText(_ctx.selectedItem.decrypted.title)), 1 /* TEXT */),
                                                    _hoisted_241
                                                  ]),
                                                  _createElementVNode("div", _hoisted_242, [
                                                    _createElementVNode("div", {
                                                      class: "min-w-0 cursor-pointer break-all font-mono text-[16px] font-semibold tracking-[0.12em]",
                                                      onClick: _cache[83] || (_cache[83] = $event => (_ctx.copyText(_ctx.activeCardData.username, false))),
                                                      title: _ctx.t('discount.copyNumber')
                                                    }, _toDisplayString(_ctx.activeCardData.username), 9 /* TEXT, PROPS */, _hoisted_243),
                                                    (_ctx.discountExtra.expiry)
                                                      ? (_openBlock(), _createElementBlock("div", _hoisted_244, [
                                                          _createElementVNode("div", _hoisted_245, _toDisplayString(_ctx.t('card.expiry')), 1 /* TEXT */),
                                                          _createElementVNode("div", _hoisted_246, _toDisplayString(_ctx.discountExtra.expiry), 1 /* TEXT */)
                                                        ]))
                                                      : _createCommentVNode("v-if", true)
                                                  ])
                                                ])
                                              ], 64 /* STABLE_FRAGMENT */))
                                        ], 4 /* STYLE */),
                                        _createElementVNode("div", _hoisted_247, [
                                          _createElementVNode("div", {
                                            class: _normalizeClass(['text-[10px] font-semibold uppercase tracking-[0.14em]', _ctx.theme === 'dark' ? 'text-[#aab9dc]' : 'text-[#7182aa]'])
                                          }, _toDisplayString(_ctx.t('discount.format.' + _ctx.discountCode.format)), 3 /* TEXT, CLASS */),
                                          _createElementVNode("div", _hoisted_248, [
                                            (_ctx.activeCardData.username)
                                              ? (_openBlock(), _createElementBlock("button", {
                                                  key: 0,
                                                  onClick: _cache[84] || (_cache[84] = $event => (_ctx.copyText(_ctx.activeCardData.username, false))),
                                                  class: "flex h-8 items-center gap-1.5 rounded-lg border border-[#315bd7]/30 px-3 text-[11px] font-semibold text-[#315bd7] dark:text-[#91d2ff]"
                                                }, [
                                                  _hoisted_249,
                                                  _createTextVNode(" " + _toDisplayString(_ctx.t('discount.copyNumber')), 1 /* TEXT */)
                                                ]))
                                              : _createCommentVNode("v-if", true),
                                            (_ctx.discountCode.svg)
                                              ? (_openBlock(), _createElementBlock("button", {
                                                  key: 1,
                                                  onClick: _cache[85] || (_cache[85] = (...args) => (_ctx.openDiscountFullscreen && _ctx.openDiscountFullscreen(...args))),
                                                  class: "flex h-8 items-center gap-1.5 rounded-lg bg-[#315bd7] px-3 text-[11px] font-semibold text-white shadow-xs"
                                                }, [
                                                  _hoisted_250,
                                                  _createTextVNode(" " + _toDisplayString(_ctx.t('discount.fullscreen')), 1 /* TEXT */)
                                                ]))
                                              : _createCommentVNode("v-if", true)
                                          ])
                                        ]),
                                        (_ctx.discountCode.svg)
                                          ? (_openBlock(), _createElementBlock("div", _hoisted_251, [
                                              _createElementVNode("div", {
                                                innerHTML: _ctx.discountCode.svg,
                                                class: _normalizeClass(['mx-auto', _ctx.discountCode.format === 'qr' ? 'max-w-[240px]' : ''])
                                              }, null, 10 /* CLASS, PROPS */, _hoisted_252),
                                              _createElementVNode("div", _hoisted_253, _toDisplayString(_ctx.discountCode.value), 1 /* TEXT */)
                                            ]))
                                          : (_openBlock(), _createElementBlock("div", _hoisted_254, [
                                              _hoisted_255,
                                              _createElementVNode("div", null, [
                                                _createElementVNode("div", null, _toDisplayString(_ctx.discountErrorText(_ctx.discountCode)), 1 /* TEXT */),
                                                (_ctx.activeCardData.username)
                                                  ? (_openBlock(), _createElementBlock("div", _hoisted_256, _toDisplayString(_ctx.activeCardData.username), 1 /* TEXT */))
                                                  : _createCommentVNode("v-if", true)
                                              ])
                                            ]))
                                      ]))
                                    : _createCommentVNode("v-if", true),
                                  (_ctx.selectedItem.decrypted.itemType !== 'discount')
                                    ? (_openBlock(), _createElementBlock("div", _hoisted_257, [
                                        _createElementVNode("div", {
                                          class: _normalizeClass(['text-[10px] font-semibold uppercase tracking-[0.14em]', _ctx.theme === 'dark' ? 'text-[#aab9dc]' : 'text-[#7182aa]'])
                                        }, _toDisplayString(_ctx.t(_ctx.selectedItem.decrypted.itemType === 'card' ? 'item.cardData' : 'item.credentials')), 3 /* TEXT, CLASS */),
                                        _createElementVNode("div", _hoisted_258, [
                                          (_ctx.activeCardData.username)
                                            ? (_openBlock(), _createElementBlock("button", {
                                                key: 0,
                                                onClick: _cache[86] || (_cache[86] = $event => (_ctx.copyText(_ctx.activeCardData.username, false))),
                                                class: "flex h-8 items-center gap-1.5 rounded-lg border border-[#315bd7]/30 px-3 text-[11px] font-semibold text-[#315bd7] dark:text-[#91d2ff]"
                                              }, [
                                                _createElementVNode("i", {
                                                  class: _normalizeClass(_ctx.selectedItem.decrypted.itemType === 'card' ? 'fa-regular fa-credit-card text-[10px]' : 'fa-regular fa-user text-[10px]')
                                                }, null, 2 /* CLASS */),
                                                _createTextVNode(" " + _toDisplayString(_ctx.t(_ctx.selectedItem.decrypted.itemType === 'card' ? 'item.copyCardNumber' : 'item.login')), 1 /* TEXT */)
                                              ]))
                                            : _createCommentVNode("v-if", true),
                                          (_ctx.activeCardData.password)
                                            ? (_openBlock(), _createElementBlock("button", {
                                                key: 1,
                                                onClick: _cache[87] || (_cache[87] = $event => (_ctx.copyText(_ctx.activeCardData.password, true))),
                                                class: "flex h-8 items-center gap-1.5 rounded-lg bg-[#315bd7] px-3 text-[11px] font-semibold text-white shadow-xs"
                                              }, [
                                                _hoisted_259,
                                                _createTextVNode(" " + _toDisplayString(_ctx.t(_ctx.selectedItem.decrypted.itemType === 'card' ? 'item.copyCvv' : 'item.copyPassword')), 1 /* TEXT */)
                                              ]))
                                            : _createCommentVNode("v-if", true)
                                        ])
                                      ]))
                                    : _createCommentVNode("v-if", true),
                                  (!['note', 'discount'].includes(_ctx.selectedItem.decrypted.itemType))
                                    ? (_openBlock(), _createElementBlock("div", {
                                        key: 3,
                                        class: _normalizeClass(['overflow-hidden rounded-xl border', _ctx.theme === 'dark' ? 'border-[#3a4b70]' : 'border-[#dfe5f3]'])
                                      }, [
                                        _createElementVNode("div", {
                                          class: _normalizeClass(['px-4 py-3 sm:px-5', _ctx.theme === 'dark' ? 'border-b border-[#3a4b70] bg-[#202e4b]' : 'border-b border-[#e5eaf6] bg-[#f8faff]'])
                                        }, [
                                          _createElementVNode("div", _hoisted_260, [
                                            _createElementVNode("label", {
                                              class: _normalizeClass(['text-[9.5px] font-semibold uppercase tracking-[0.12em]', _ctx.theme === 'dark' ? 'text-[#aab9dc]' : 'text-[#7586ad]'])
                                            }, _toDisplayString(_ctx.selectedItem.decrypted.itemType === 'card' ? _ctx.t('item.cardNumber') : (_ctx.selectedItem.decrypted.itemType === 'wifi' ? _ctx.t('item.wifiSsid') : _ctx.t('item.loginEmail'))), 3 /* TEXT, CLASS */),
                                            _createElementVNode("button", {
                                              onClick: _cache[88] || (_cache[88] = $event => (_ctx.copyText(_ctx.activeCardData.username, false))),
                                              class: "text-[10.5px] font-semibold text-[#315bd7] dark:text-[#91d2ff]"
                                            }, [
                                              _hoisted_261,
                                              _createTextVNode(" " + _toDisplayString(_ctx.t('common.copy')), 1 /* TEXT */)
                                            ])
                                          ]),
                                          _createElementVNode("div", _hoisted_262, _toDisplayString(_ctx.activeCardData.username || _ctx.t('item.notSet')), 1 /* TEXT */)
                                        ], 2 /* CLASS */),
                                        _createElementVNode("div", {
                                          class: _normalizeClass(['px-4 py-3 sm:px-5', _ctx.theme === 'dark' ? 'bg-[#1b2740]' : 'bg-[#fffefa]'])
                                        }, [
                                          _createElementVNode("div", _hoisted_263, [
                                            _createElementVNode("label", {
                                              class: _normalizeClass(['text-[9.5px] font-semibold uppercase tracking-[0.12em]', _ctx.theme === 'dark' ? 'text-[#aab9dc]' : 'text-[#7586ad]'])
                                            }, _toDisplayString(_ctx.selectedItem.decrypted.itemType === 'card' ? _ctx.t('item.cvv') : _ctx.t('item.password')), 3 /* TEXT, CLASS */),
                                            _createElementVNode("div", _hoisted_264, [
                                              (_ctx.selectedItem.decrypted.itemType !== 'card')
                                                ? (_openBlock(), _createElementBlock("button", {
                                                    key: 0,
                                                    onClick: _cache[89] || (_cache[89] = $event => (_ctx.checkPwned(_ctx.activeCardData.password, _ctx.pwnedKey(_ctx.activeSubCardIdx)))),
                                                    class: "text-[10.5px] font-semibold text-[#315bd7] dark:text-[#91d2ff]",
                                                    title: _ctx.t('pwned.hint')
                                                  }, [
                                                    _hoisted_266,
                                                    _createTextVNode(" " + _toDisplayString(_ctx.t('pwned.button')), 1 /* TEXT */)
                                                  ], 8 /* PROPS */, _hoisted_265))
                                                : _createCommentVNode("v-if", true),
                                              _createElementVNode("button", {
                                                onClick: _cache[90] || (_cache[90] = $event => (_ctx.selectedItem.showPwd = !_ctx.selectedItem.showPwd)),
                                                class: "text-[10.5px] font-semibold text-[#315bd7] dark:text-[#91d2ff]"
                                              }, [
                                                _createElementVNode("i", {
                                                  class: _normalizeClass(_ctx.selectedItem.showPwd ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye')
                                                }, null, 2 /* CLASS */),
                                                _createTextVNode(" " + _toDisplayString(_ctx.selectedItem.showPwd ? _ctx.t('common.hide') : _ctx.t('common.show')), 1 /* TEXT */)
                                              ]),
                                              _createElementVNode("button", {
                                                onClick: _cache[91] || (_cache[91] = $event => (_ctx.copyText(_ctx.activeCardData.password, true))),
                                                class: "text-[10.5px] font-semibold text-[#315bd7] dark:text-[#91d2ff]"
                                              }, [
                                                _hoisted_267,
                                                _createTextVNode(" " + _toDisplayString(_ctx.t('common.copy')), 1 /* TEXT */)
                                              ])
                                            ])
                                          ]),
                                          _createElementVNode("div", _hoisted_268, _toDisplayString(_ctx.selectedItem.showPwd ? (_ctx.activeCardData.password || _ctx.t('item.empty')) : '••••••••••••••••'), 1 /* TEXT */),
                                          (_ctx.pwnedInfo(_ctx.pwnedKey(_ctx.activeSubCardIdx)))
                                            ? (_openBlock(), _createElementBlock("div", {
                                                key: 0,
                                                class: _normalizeClass(['mt-1.5 text-[11px] font-semibold', _ctx.pwnedInfo(_ctx.pwnedKey(_ctx.activeSubCardIdx)).cls])
                                              }, _toDisplayString(_ctx.pwnedInfo(_ctx.pwnedKey(_ctx.activeSubCardIdx)).text), 3 /* TEXT, CLASS */))
                                            : _createCommentVNode("v-if", true)
                                        ], 2 /* CLASS */),
                                        (_ctx.selectedItem.decrypted.totpSecret)
                                          ? (_openBlock(), _createElementBlock("div", {
                                              key: 0,
                                              onClick: _cache[92] || (_cache[92] = $event => (_ctx.copyText(_ctx.selectedItem.totpCode, false))),
                                              class: _normalizeClass(['px-4 py-3 sm:px-5 border-t cursor-pointer flex items-center justify-between', _ctx.theme === 'dark' ? 'border-[#3a4b70] bg-[#202e4b]' : 'border-[#e5eaf6] bg-[#f8faff]'])
                                            }, [
                                              _createElementVNode("div", null, [
                                                _createElementVNode("div", _hoisted_269, _toDisplayString(_ctx.t('item.totpCode')), 1 /* TEXT */),
                                                _createElementVNode("div", _hoisted_270, _toDisplayString(_ctx.formatTotp(_ctx.selectedItem.totpCode)), 1 /* TEXT */)
                                              ]),
                                              _createElementVNode("span", _hoisted_271, _toDisplayString(_ctx.t('common.seconds', { n: _ctx.selectedItem.totpSecondsLeft })), 1 /* TEXT */)
                                            ], 2 /* CLASS */))
                                          : _createCommentVNode("v-if", true)
                                      ], 2 /* CLASS */))
                                    : _createCommentVNode("v-if", true),
                                  (_ctx.selectedItem.decrypted.itemType === 'wifi' && _ctx.activeCardData.username && _ctx.activeCardData.password)
                                    ? (_openBlock(), _createElementBlock("div", {
                                        key: 4,
                                        class: _normalizeClass(['rounded-xl border p-4 flex items-center gap-4', _ctx.theme === 'dark' ? 'border-[#3a4b70] bg-[#202e4b]' : 'border-[#dfe5f3] bg-[#f8faff]'])
                                      }, [
                                        _createElementVNode("div", {
                                          class: "bg-white p-2 rounded-lg shrink-0",
                                          innerHTML: _ctx.generateWifiQrSvg(_ctx.activeCardData.username, _ctx.activeCardData.password)
                                        }, null, 8 /* PROPS */, _hoisted_272),
                                        _createElementVNode("div", null, [
                                          _createElementVNode("div", _hoisted_273, _toDisplayString(_ctx.t('wifi.qrTitle')), 1 /* TEXT */),
                                          _createElementVNode("p", _hoisted_274, _toDisplayString(_ctx.t('wifi.qrHint', { ssid: _ctx.activeCardData.username })), 1 /* TEXT */)
                                        ])
                                      ], 2 /* CLASS */))
                                    : _createCommentVNode("v-if", true),
                                  (_ctx.visibleCustomFieldCount > 0)
                                    ? (_openBlock(), _createElementBlock("div", {
                                        key: 5,
                                        class: _normalizeClass(['rounded-xl border overflow-hidden', _ctx.theme === 'dark' ? 'border-[#3a4b70]' : 'border-[#dfe5f3]'])
                                      }, [
                                        (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(_ctx.selectedItem.decrypted.customFields, (cf, idx) => {
                                          return (_openBlock(), _createElementBlock(_Fragment, { key: idx }, [
                                            (_ctx.isHiddenCustomField(cf))
                                              ? (_openBlock(), _createElementBlock(_Fragment, { key: 0 }, [], 64 /* STABLE_FRAGMENT */))
                                              : (_ctx.isSecretFieldLabel(cf.label))
                                                ? (_openBlock(), _createElementBlock("div", {
                                                    key: 1,
                                                    class: _normalizeClass(['px-4 py-2.5 flex items-center justify-between gap-2 border-b last:border-b-0', _ctx.theme === 'dark' ? 'border-[#3a4b70] bg-[#202e4b]' : 'border-[#e5eaf6] bg-[#f8faff]'])
                                                  }, [
                                                    _createElementVNode("div", _hoisted_275, [
                                                      _createElementVNode("div", _hoisted_276, _toDisplayString(cf.label), 1 /* TEXT */),
                                                      _createElementVNode("div", _hoisted_277, _toDisplayString(_ctx.shownPwds[_ctx.customFieldKey(idx)] ? (cf.value || _ctx.t('item.empty')) : '••••••'), 1 /* TEXT */)
                                                    ]),
                                                    _createElementVNode("div", _hoisted_278, [
                                                      _createElementVNode("button", {
                                                        onClick: $event => (_ctx.toggleShownPwd(_ctx.customFieldKey(idx))),
                                                        class: "text-[10.5px] font-semibold text-[#315bd7] dark:text-[#91d2ff]"
                                                      }, [
                                                        _createElementVNode("i", {
                                                          class: _normalizeClass(_ctx.shownPwds[_ctx.customFieldKey(idx)] ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye')
                                                        }, null, 2 /* CLASS */),
                                                        _createTextVNode(" " + _toDisplayString(_ctx.shownPwds[_ctx.customFieldKey(idx)] ? _ctx.t('common.hide') : _ctx.t('common.show')), 1 /* TEXT */)
                                                      ], 8 /* PROPS */, _hoisted_279),
                                                      _createElementVNode("button", {
                                                        onClick: $event => (_ctx.copyText(cf.value, true)),
                                                        class: "text-[10.5px] font-semibold text-[#315bd7] dark:text-[#91d2ff]"
                                                      }, [
                                                        _hoisted_281,
                                                        _createTextVNode(" " + _toDisplayString(_ctx.t('common.copy')), 1 /* TEXT */)
                                                      ], 8 /* PROPS */, _hoisted_280)
                                                    ])
                                                  ], 2 /* CLASS */))
                                                : (_openBlock(), _createElementBlock("div", {
                                                    key: 2,
                                                    onClick: $event => (_ctx.copyText(cf.value, false)),
                                                    class: _normalizeClass(['px-4 py-2.5 flex items-center justify-between cursor-pointer border-b last:border-b-0', _ctx.theme === 'dark' ? 'border-[#3a4b70] bg-[#202e4b]' : 'border-[#e5eaf6] bg-[#f8faff]'])
                                                  }, [
                                                    _createElementVNode("div", null, [
                                                      _createElementVNode("div", _hoisted_283, _toDisplayString(cf.label), 1 /* TEXT */),
                                                      _createElementVNode("div", _hoisted_284, _toDisplayString(cf.value), 1 /* TEXT */)
                                                    ]),
                                                    _hoisted_285
                                                  ], 10 /* CLASS, PROPS */, _hoisted_282))
                                          ], 64 /* STABLE_FRAGMENT */))
                                        }), 128 /* KEYED_FRAGMENT */))
                                      ], 2 /* CLASS */))
                                    : _createCommentVNode("v-if", true),
                                  (_ctx.activeCardData.note || _ctx.selectedItem.decrypted.itemType === 'note')
                                    ? (_openBlock(), _createElementBlock("div", {
                                        key: 6,
                                        class: _normalizeClass(['rounded-xl border p-4 whitespace-pre-wrap text-[13px] leading-relaxed', _ctx.theme === 'dark' ? 'border-[#3a4b70] bg-[#202e4b]' : 'border-[#dfe5f3] bg-[#f8faff]'])
                                      }, [
                                        _createElementVNode("div", _hoisted_286, _toDisplayString(_ctx.t('item.note')), 1 /* TEXT */),
                                        _createTextVNode(" " + _toDisplayString(_ctx.activeCardData.note || _ctx.t('item.noteEmpty')), 1 /* TEXT */)
                                      ], 2 /* CLASS */))
                                    : _createCommentVNode("v-if", true),
                                  _createElementVNode("div", _hoisted_287, [
                                    (!['card', 'discount'].includes(_ctx.selectedItem.decrypted.itemType))
                                      ? (_openBlock(), _createElementBlock("div", {
                                          key: 0,
                                          class: _normalizeClass(['rounded-xl border p-3.5', _ctx.theme === 'dark' ? 'border-[#475680] bg-[#222f4e]' : 'border-[#dbe4fb] bg-[#f1f5ff]'])
                                        }, [
                                          _createElementVNode("div", _hoisted_288, [
                                            _hoisted_289,
                                            _createElementVNode("span", _hoisted_290, _toDisplayString(_ctx.t('item.site')), 1 /* TEXT */)
                                          ]),
                                          _createElementVNode("div", _hoisted_291, [
                                            (_ctx.activeCardData.url)
                                              ? (_openBlock(), _createElementBlock("a", {
                                                  key: 0,
                                                  href: _ctx.getWorkingWebUrl(_ctx.activeCardData.url, _ctx.activeCardData.title),
                                                  target: "_blank",
                                                  rel: "noopener noreferrer",
                                                  class: "truncate text-[12px] font-semibold underline"
                                                }, _toDisplayString(_ctx.decodePunycodeText(_ctx.getWorkingWebUrl(_ctx.activeCardData.url, _ctx.activeCardData.title))), 9 /* TEXT, PROPS */, _hoisted_292))
                                              : (_openBlock(), _createElementBlock("span", _hoisted_293, _toDisplayString(_ctx.t('item.noUrl')), 1 /* TEXT */)),
                                            (_ctx.activeCardData.url)
                                              ? (_openBlock(), _createElementBlock("div", _hoisted_294, [
                                                  _createElementVNode("a", {
                                                    href: _ctx.getWorkingWebUrl(_ctx.activeCardData.url, _ctx.activeCardData.title),
                                                    target: "_blank",
                                                    rel: "noopener noreferrer",
                                                    class: "rounded-md bg-[#315bd7] px-2.5 py-1 text-[10px] font-semibold text-white"
                                                  }, _toDisplayString(_ctx.t('common.open')), 9 /* TEXT, PROPS */, _hoisted_295),
                                                  (_ctx.isAndroidAppUrl(_ctx.activeCardData.url))
                                                    ? (_openBlock(), _createElementBlock("a", {
                                                        key: 0,
                                                        href: _ctx.getGooglePlayUrl(_ctx.activeCardData.url),
                                                        target: "_blank",
                                                        rel: "noopener noreferrer",
                                                        class: "rounded-md border border-[#315bd7] px-2 py-1 text-[10px] font-semibold"
                                                      }, " Play ", 8 /* PROPS */, _hoisted_296))
                                                    : _createCommentVNode("v-if", true)
                                                ]))
                                              : _createCommentVNode("v-if", true)
                                          ])
                                        ], 2 /* CLASS */))
                                      : _createCommentVNode("v-if", true),
                                    _createElementVNode("div", {
                                      class: _normalizeClass(['rounded-xl border p-3.5', _ctx.theme === 'dark' ? 'border-[#3e7869] bg-[#203b3b]' : 'border-[#bce6d3] bg-[#ecf9f0]'])
                                    }, [
                                      _createElementVNode("div", _hoisted_297, [
                                        _hoisted_298,
                                        _createElementVNode("span", _hoisted_299, _toDisplayString(_ctx.t('item.protection')), 1 /* TEXT */)
                                      ]),
                                      _createElementVNode("div", _hoisted_300, [
                                        _hoisted_301,
                                        _createElementVNode("span", _hoisted_302, _toDisplayString(_ctx.t('item.protectedBadge')), 1 /* TEXT */)
                                      ])
                                    ], 2 /* CLASS */)
                                  ])
                                ], 64 /* STABLE_FRAGMENT */))
                              : (_openBlock(), _createElementBlock("div", _hoisted_303, [
                                  (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(_ctx.selectedItem.decrypted.subCards, (sc, sIdx) => {
                                    return (_openBlock(), _createElementBlock("div", {
                                      key: sIdx,
                                      class: _normalizeClass(['rounded-xl border p-3.5 space-y-2', _ctx.theme === 'dark' ? 'border-[#3a4b70] bg-[#202e4b]' : 'border-[#dfe5f3] bg-[#f8faff]'])
                                    }, [
                                      _createElementVNode("div", _hoisted_304, [
                                        _createElementVNode("div", _hoisted_305, [
                                          _createTextVNode(" #" + _toDisplayString(sIdx + 1) + " " + _toDisplayString(_ctx.decodePunycodeText(sc.title)) + " ", 1 /* TEXT */),
                                          _createElementVNode("span", _hoisted_306, _toDisplayString(_ctx.formatDomain(sc.url)), 1 /* TEXT */)
                                        ]),
                                        (sc.url)
                                          ? (_openBlock(), _createElementBlock("a", {
                                              key: 0,
                                              href: _ctx.getWorkingWebUrl(sc.url, sc.title),
                                              target: "_blank",
                                              rel: "noopener noreferrer",
                                              class: "shrink-0 rounded-md bg-[#315bd7] px-2.5 py-1 text-[10px] font-semibold text-white"
                                            }, _toDisplayString(_ctx.t('common.open')), 9 /* TEXT, PROPS */, _hoisted_307))
                                          : _createCommentVNode("v-if", true)
                                      ]),
                                      _createElementVNode("div", {
                                        class: "flex items-center justify-between gap-2 cursor-pointer",
                                        onClick: $event => (_ctx.copyText(sc.username, false))
                                      }, [
                                        _createElementVNode("div", _hoisted_309, [
                                          _createElementVNode("div", _hoisted_310, _toDisplayString(_ctx.t('item.loginEmail')), 1 /* TEXT */),
                                          _createElementVNode("div", _hoisted_311, _toDisplayString(sc.username || _ctx.t('item.notSet')), 1 /* TEXT */)
                                        ]),
                                        _hoisted_312
                                      ], 8 /* PROPS */, _hoisted_308),
                                      _createElementVNode("div", null, [
                                        _createElementVNode("div", _hoisted_313, [
                                          _createElementVNode("div", _hoisted_314, _toDisplayString(_ctx.t('item.password')), 1 /* TEXT */),
                                          _createElementVNode("div", _hoisted_315, [
                                            _createElementVNode("button", {
                                              onClick: $event => (_ctx.checkPwned(sc.password, _ctx.pwnedKey(sIdx))),
                                              class: "text-[10.5px] font-semibold text-[#315bd7] dark:text-[#91d2ff]"
                                            }, [
                                              _hoisted_317,
                                              _createTextVNode(" " + _toDisplayString(_ctx.t('pwned.button')), 1 /* TEXT */)
                                            ], 8 /* PROPS */, _hoisted_316),
                                            _createElementVNode("button", {
                                              onClick: $event => (_ctx.toggleShownPwd(_ctx.pwnedKey(sIdx))),
                                              class: "text-[10.5px] font-semibold text-[#315bd7] dark:text-[#91d2ff]"
                                            }, [
                                              _createElementVNode("i", {
                                                class: _normalizeClass(_ctx.shownPwds[_ctx.pwnedKey(sIdx)] ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye')
                                              }, null, 2 /* CLASS */),
                                              _createTextVNode(" " + _toDisplayString(_ctx.shownPwds[_ctx.pwnedKey(sIdx)] ? _ctx.t('common.hide') : _ctx.t('common.show')), 1 /* TEXT */)
                                            ], 8 /* PROPS */, _hoisted_318),
                                            _createElementVNode("button", {
                                              onClick: $event => (_ctx.copyText(sc.password, true)),
                                              class: "text-[10.5px] font-semibold text-[#315bd7] dark:text-[#91d2ff]"
                                            }, [
                                              _hoisted_320,
                                              _createTextVNode(" " + _toDisplayString(_ctx.t('common.copy')), 1 /* TEXT */)
                                            ], 8 /* PROPS */, _hoisted_319)
                                          ])
                                        ]),
                                        _createElementVNode("div", _hoisted_321, _toDisplayString(_ctx.shownPwds[_ctx.pwnedKey(sIdx)] ? (sc.password || _ctx.t('item.empty')) : '••••••••••••••••'), 1 /* TEXT */),
                                        (_ctx.pwnedInfo(_ctx.pwnedKey(sIdx)))
                                          ? (_openBlock(), _createElementBlock("div", {
                                              key: 0,
                                              class: _normalizeClass(['mt-1 text-[11px] font-semibold', _ctx.pwnedInfo(_ctx.pwnedKey(sIdx)).cls])
                                            }, _toDisplayString(_ctx.pwnedInfo(_ctx.pwnedKey(sIdx)).text), 3 /* TEXT, CLASS */))
                                          : _createCommentVNode("v-if", true)
                                      ]),
                                      (sc.note)
                                        ? (_openBlock(), _createElementBlock("div", _hoisted_322, _toDisplayString(sc.note), 1 /* TEXT */))
                                        : _createCommentVNode("v-if", true)
                                    ], 2 /* CLASS */))
                                  }), 128 /* KEYED_FRAGMENT */))
                                ])),
                            (_ctx.selectedItem.decrypted.passwordHistory && _ctx.selectedItem.decrypted.passwordHistory.length > 0)
                              ? (_openBlock(), _createElementBlock("div", {
                                  key: 3,
                                  class: _normalizeClass(['rounded-xl border p-3.5 text-xs', _ctx.theme === 'dark' ? 'border-[#324260]' : 'border-[#e7ebf5]'])
                                }, [
                                  _createElementVNode("div", _hoisted_323, _toDisplayString(_ctx.t('item.history', { n: _ctx.selectedItem.decrypted.passwordHistory.length })), 1 /* TEXT */),
                                  (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(_ctx.selectedItem.decrypted.passwordHistory, (ph, pIdx) => {
                                    return (_openBlock(), _createElementBlock("div", {
                                      key: pIdx,
                                      class: "flex justify-between items-center gap-2 py-1 border-b last:border-b-0 border-black/5 dark:border-white/5 font-mono text-[11px]"
                                    }, [
                                      _createElementVNode("span", _hoisted_324, _toDisplayString(ph.password), 1 /* TEXT */),
                                      _createElementVNode("span", _hoisted_325, _toDisplayString(_ctx.formatTimestamp(ph.changedAt)), 1 /* TEXT */),
                                      _createElementVNode("button", {
                                        onClick: $event => (_ctx.copyText(ph.password, true)),
                                        class: "shrink-0 text-[#315bd7] dark:text-[#91d2ff] text-[10px]"
                                      }, _toDisplayString(_ctx.t('common.copy')), 9 /* TEXT, PROPS */, _hoisted_326)
                                    ]))
                                  }), 128 /* KEYED_FRAGMENT */))
                                ], 2 /* CLASS */))
                              : _createCommentVNode("v-if", true)
                          ])
                        ], 2 /* CLASS */))
                      : (_openBlock(), _createElementBlock("section", {
                          key: 1,
                          class: _normalizeClass(['hidden xl:flex flex-col items-center justify-center rounded-xl border px-8 text-center', _ctx.theme === 'dark' ? 'border-[#324260] bg-[#1a2741]' : 'border-[#dce3f4] bg-[#fffefa]'])
                        }, [
                          _createElementVNode("div", {
                            class: _normalizeClass(['mb-4 grid h-14 w-14 place-items-center rounded-2xl', _ctx.theme === 'dark' ? 'bg-[#324877] text-[#f5cf73]' : 'bg-[#e7edff] text-[#315bd7]'])
                          }, _hoisted_328, 2 /* CLASS */),
                          _createElementVNode("h2", _hoisted_329, _toDisplayString(_ctx.t('item.pickTitle')), 1 /* TEXT */),
                          _createElementVNode("p", _hoisted_330, _toDisplayString(_ctx.t('item.pickHint')), 1 /* TEXT */)
                        ], 2 /* CLASS */))
                  ]))
                : (_openBlock(), _createElementBlock("div", _hoisted_331, [
                    (_ctx.rightPaneMode === 'duplicates')
                      ? (_openBlock(), _createElementBlock("div", _hoisted_332, [
                          _createElementVNode("div", _hoisted_333, [
                            _createElementVNode("div", _hoisted_334, [
                              _createElementVNode("button", {
                                onClick: _cache[93] || (_cache[93] = $event => (_ctx.dupGroupByMode = 'domain')),
                                class: _normalizeClass(['rounded-lg px-3 py-1.5 text-xs font-semibold transition', _ctx.dupGroupByMode === 'domain' ? 'bg-[#315bd7] text-white' : 'bg-white dark:bg-[#1a2741] border border-[#dce3f4] dark:border-[#324260]'])
                              }, _toDisplayString(_ctx.t('dup.byDomain')), 3 /* TEXT, CLASS */),
                              _createElementVNode("button", {
                                onClick: _cache[94] || (_cache[94] = $event => (_ctx.dupGroupByMode = 'strict')),
                                class: _normalizeClass(['rounded-lg px-3 py-1.5 text-xs font-semibold transition', _ctx.dupGroupByMode === 'strict' ? 'bg-[#315bd7] text-white' : 'bg-white dark:bg-[#1a2741] border border-[#dce3f4] dark:border-[#324260]'])
                              }, _toDisplayString(_ctx.t('dup.byDomainLogin')), 3 /* TEXT, CLASS */)
                            ]),
                            (_ctx.ignoredDupKeys.length > 0)
                              ? (_openBlock(), _createElementBlock("button", {
                                  key: 0,
                                  onClick: _cache[95] || (_cache[95] = (...args) => (_ctx.resetIgnoredDuplicates && _ctx.resetIgnoredDuplicates(...args))),
                                  class: "text-xs text-[#315bd7] dark:text-[#91d2ff] underline"
                                }, _toDisplayString(_ctx.t('dup.restoreHidden', { n: _ctx.ignoredDupKeys.length })), 1 /* TEXT */))
                              : _createCommentVNode("v-if", true)
                          ]),
                          (_ctx.duplicateGroups.length === 0)
                            ? (_openBlock(), _createElementBlock("div", {
                                key: 0,
                                class: _normalizeClass(['rounded-xl border p-10 text-center', _ctx.theme === 'dark' ? 'border-[#324260] bg-[#1a2741]' : 'border-[#dce3f4] bg-[#fffefa]'])
                              }, [
                                _hoisted_335,
                                _createElementVNode("div", _hoisted_336, _toDisplayString(_ctx.t('dup.none')), 1 /* TEXT */)
                              ], 2 /* CLASS */))
                            : _createCommentVNode("v-if", true),
                          (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(_ctx.duplicateGroups, (grp) => {
                            return (_openBlock(), _createElementBlock("div", {
                              key: grp.key,
                              class: _normalizeClass(['rounded-xl border p-4 sm:p-5 shadow-xs', _ctx.theme === 'dark' ? 'border-[#324260] bg-[#1a2741]' : 'border-[#dce3f4] bg-[#fffefa]'])
                            }, [
                              _createElementVNode("div", {
                                class: _normalizeClass(["flex flex-wrap items-center justify-between gap-3 border-b pb-3", _ctx.theme === 'dark' ? 'border-[#324260]' : 'border-[#e7ebf5]'])
                              }, [
                                _createElementVNode("div", _hoisted_337, [
                                  _createElementVNode("div", {
                                    class: "grid h-9 w-9 place-items-center rounded-xl text-white font-bold text-sm",
                                    style: _normalizeStyle({ backgroundColor: _ctx.getEntryColorHex(grp.title) })
                                  }, _toDisplayString(_ctx.getInitials(_ctx.decodePunycodeText(grp.title))), 5 /* TEXT, STYLE */),
                                  _createElementVNode("div", null, [
                                    _createElementVNode("div", _hoisted_338, _toDisplayString(_ctx.decodePunycodeText(grp.title)), 1 /* TEXT */),
                                    _createElementVNode("div", _hoisted_339, _toDisplayString(_ctx.t('dup.count', { n: grp.items.length })), 1 /* TEXT */)
                                  ])
                                ]),
                                _createElementVNode("div", _hoisted_340, [
                                  _createElementVNode("button", {
                                    onClick: $event => (_ctx.ignoreDuplicateGroup(grp.key)),
                                    class: "rounded-lg border border-[#d8e0f3] dark:border-[#3b4c6f] px-2.5 py-1.5 text-[11px] font-semibold"
                                  }, _toDisplayString(_ctx.t('common.hide')), 9 /* TEXT, PROPS */, _hoisted_341),
                                  _createElementVNode("button", {
                                    onClick: $event => (_ctx.combineIntoMultiCard(grp)),
                                    class: "rounded-lg bg-[#315bd7] px-3 py-1.5 text-[11px] font-semibold text-white"
                                  }, _toDisplayString(_ctx.t('merge.toMulti')) + " (" + _toDisplayString(grp.items.filter(i => i.mergeSelected !== false).length) + ") ", 9 /* TEXT, PROPS */, _hoisted_342),
                                  _createElementVNode("button", {
                                    onClick: $event => (_ctx.mergeSingleGroup(grp)),
                                    class: "rounded-lg border border-[#d8e0f3] dark:border-[#3b4c6f] px-2.5 py-1.5 text-[11px] font-semibold"
                                  }, _toDisplayString(_ctx.t('merge.toOne')), 9 /* TEXT, PROPS */, _hoisted_343),
                                  _createElementVNode("button", {
                                    onClick: $event => (_ctx.deleteSelectedInGroup(grp)),
                                    class: "rounded-lg border border-[#e11d48]/40 bg-[#e11d48]/10 px-2.5 py-1.5 text-[11px] font-semibold text-[#e11d48]"
                                  }, _toDisplayString(_ctx.t('common.delete')) + " (" + _toDisplayString(grp.items.filter(i => i.mergeSelected !== false).length) + ") ", 9 /* TEXT, PROPS */, _hoisted_344)
                                ])
                              ], 2 /* CLASS */),
                              _createElementVNode("div", _hoisted_345, [
                                (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(grp.items, (dup) => {
                                  return (_openBlock(), _createElementBlock("div", {
                                    key: dup.id,
                                    class: _normalizeClass(['rounded-xl border p-3 space-y-1.5', _ctx.theme === 'dark' ? 'border-[#3a4b70] bg-[#202e4b]' : 'border-[#dfe5f3] bg-[#f8faff]'])
                                  }, [
                                    _createElementVNode("div", {
                                      class: _normalizeClass(["flex items-center justify-between text-xs font-bold border-b pb-1.5", _ctx.theme === 'dark' ? 'border-[#3a4b70]' : 'border-[#e5eaf6]'])
                                    }, [
                                      _createElementVNode("label", _hoisted_346, [
                                        _withDirectives(_createElementVNode("input", {
                                          type: "checkbox",
                                          "onUpdate:modelValue": $event => ((dup.mergeSelected) = $event),
                                          class: "accent-[#315bd7]"
                                        }, null, 8 /* PROPS */, _hoisted_347), [
                                          [_vModelCheckbox, dup.mergeSelected]
                                        ]),
                                        _createElementVNode("span", null, "ID #" + _toDisplayString(dup.id), 1 /* TEXT */)
                                      ]),
                                      _createElementVNode("label", _hoisted_348, [
                                        _createElementVNode("input", {
                                          type: "radio",
                                          name: 'p_' + grp.key,
                                          checked: (grp.primaryId || grp.items[0].id) === dup.id,
                                          onChange: $event => (grp.primaryId = dup.id)
                                        }, null, 40 /* PROPS, HYDRATE_EVENTS */, _hoisted_349),
                                        _createElementVNode("span", null, _toDisplayString(_ctx.t('dup.primary')), 1 /* TEXT */)
                                      ])
                                    ], 2 /* CLASS */),
                                    _createElementVNode("div", _hoisted_350, _toDisplayString(_ctx.decodePunycodeText(dup.decrypted.title)), 1 /* TEXT */),
                                    _createElementVNode("div", _hoisted_351, _toDisplayString(dup.decrypted.username || '—'), 1 /* TEXT */),
                                    _createElementVNode("div", _hoisted_352, [
                                      _createElementVNode("span", _hoisted_353, _toDisplayString(dup.showPwd ? dup.decrypted.password : '••••••••••'), 1 /* TEXT */),
                                      _createElementVNode("button", {
                                        onClick: $event => (dup.showPwd = !dup.showPwd),
                                        class: "text-[10px] underline text-[#315bd7] dark:text-[#91d2ff]"
                                      }, _toDisplayString(dup.showPwd ? _ctx.t('common.hide') : _ctx.t('common.show')), 9 /* TEXT, PROPS */, _hoisted_354)
                                    ])
                                  ], 2 /* CLASS */))
                                }), 128 /* KEYED_FRAGMENT */))
                              ])
                            ], 2 /* CLASS */))
                          }), 128 /* KEYED_FRAGMENT */))
                        ]))
                      : (_ctx.rightPaneMode === 'totp_hub')
                        ? (_openBlock(), _createElementBlock("div", _hoisted_355, [
                            (_ctx.itemsWithTotp.length === 0)
                              ? (_openBlock(), _createElementBlock("div", {
                                  key: 0,
                                  class: _normalizeClass(['col-span-full rounded-xl border p-8 text-center text-xs opacity-75', _ctx.theme === 'dark' ? 'border-[#324260] bg-[#1a2741]' : 'border-[#dce3f4] bg-[#fffefa]'])
                                }, _toDisplayString(_ctx.t('totp.none')), 3 /* TEXT, CLASS */))
                              : _createCommentVNode("v-if", true),
                            (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(_ctx.itemsWithTotp, (tItem) => {
                              return (_openBlock(), _createElementBlock("div", {
                                key: tItem.id,
                                onClick: $event => (_ctx.copyText(tItem.totpCode, false)),
                                class: _normalizeClass(['rounded-xl border p-4 cursor-pointer flex items-center justify-between', _ctx.theme === 'dark' ? 'border-[#324260] bg-[#1a2741]' : 'border-[#dce3f4] bg-[#fffefa]'])
                              }, [
                                _createElementVNode("div", null, [
                                  _createElementVNode("div", _hoisted_357, _toDisplayString(_ctx.decodePunycodeText(tItem.decrypted.title)), 1 /* TEXT */),
                                  _createElementVNode("div", _hoisted_358, _toDisplayString(_ctx.formatTotp(tItem.totpCode)), 1 /* TEXT */)
                                ]),
                                _createElementVNode("span", _hoisted_359, _toDisplayString(_ctx.t('common.seconds', { n: tItem.totpSecondsLeft })), 1 /* TEXT */)
                              ], 10 /* CLASS, PROPS */, _hoisted_356))
                            }), 128 /* KEYED_FRAGMENT */))
                          ]))
                        : (_openBlock(), _createElementBlock("div", _hoisted_360, [
                            _createElementVNode("div", {
                              class: _normalizeClass(['rounded-xl border p-4 sm:p-5', _ctx.theme === 'dark' ? 'border-[#324260] bg-[#1a2741]' : 'border-[#dce3f4] bg-[#fffefa]'])
                            }, [
                              _createElementVNode("div", _hoisted_361, [
                                _createElementVNode("h3", _hoisted_362, _toDisplayString(_ctx.t('nav.folders')), 1 /* TEXT */),
                                _createElementVNode("button", {
                                  onClick: _cache[96] || (_cache[96] = $event => (_ctx.autoSortItemsIntoFolders(true))),
                                  class: "text-xs font-semibold text-[#315bd7] dark:text-[#91d2ff]"
                                }, _toDisplayString(_ctx.t('settings.autoSort')), 1 /* TEXT */)
                              ]),
                              _createElementVNode("div", _hoisted_363, [
                                (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(_ctx.allFolders, (fld) => {
                                  return (_openBlock(), _createElementBlock("button", {
                                    key: fld.id,
                                    onClick: $event => (_ctx.setFilter('all', 'all', fld.id)),
                                    class: _normalizeClass(['flex items-center gap-2.5 rounded-xl border p-3 text-left transition', _ctx.theme === 'dark' ? 'border-[#3a4b70] bg-[#202e4b]' : 'border-[#dfe5f3] bg-[#f8faff]'])
                                  }, [
                                    _createElementVNode("span", {
                                      class: _normalizeClass(['grid h-8 w-8 shrink-0 place-items-center rounded-lg', fld.tintClass])
                                    }, [
                                      _createElementVNode("i", {
                                        class: _normalizeClass([fld.icon, 'text-xs'])
                                      }, null, 2 /* CLASS */)
                                    ], 2 /* CLASS */),
                                    _createElementVNode("div", _hoisted_365, [
                                      _createElementVNode("div", _hoisted_366, _toDisplayString(fld.name), 1 /* TEXT */),
                                      _createElementVNode("div", _hoisted_367, _toDisplayString(_ctx.tp('folder.items', _ctx.countByFolder(fld.id), { n: _ctx.countByFolder(fld.id) })), 1 /* TEXT */)
                                    ])
                                  ], 10 /* CLASS, PROPS */, _hoisted_364))
                                }), 128 /* KEYED_FRAGMENT */))
                              ])
                            ], 2 /* CLASS */),
                            _createElementVNode("div", _hoisted_368, [
                              _createElementVNode("div", {
                                class: _normalizeClass(['rounded-xl border p-4 sm:p-5 space-y-3', _ctx.theme === 'dark' ? 'border-[#324260] bg-[#1a2741]' : 'border-[#dce3f4] bg-[#fffefa]'])
                              }, [
                                _createElementVNode("h3", _hoisted_369, _toDisplayString(_ctx.t('settings.tools')), 1 /* TEXT */),
                                _createElementVNode("div", _hoisted_370, [
                                  _createElementVNode("button", {
                                    onClick: _cache[97] || (_cache[97] = (...args) => (_ctx.openPasswordGenerator && _ctx.openPasswordGenerator(...args))),
                                    class: "rounded-lg bg-[#315bd7] px-3 py-2 text-xs font-semibold text-white"
                                  }, _toDisplayString(_ctx.t('settings.generator')), 1 /* TEXT */),
                                  _createElementVNode("button", {
                                    onClick: _cache[98] || (_cache[98] = $event => (_ctx.showExtensionModal = true)),
                                    class: "rounded-lg border border-[#d8e0f3] dark:border-[#3b4c6f] px-3 py-2 text-xs font-semibold"
                                  }, _toDisplayString(_ctx.t('settings.extension')), 1 /* TEXT */),
                                  _createElementVNode("button", {
                                    onClick: _cache[99] || (_cache[99] = (...args) => (_ctx.triggerPwaInstall && _ctx.triggerPwaInstall(...args))),
                                    class: "rounded-lg border border-[#d8e0f3] dark:border-[#3b4c6f] px-3 py-2 text-xs font-semibold"
                                  }, _toDisplayString(_ctx.t('settings.installPwa')), 1 /* TEXT */),
                                  _createElementVNode("button", {
                                    onClick: _cache[100] || (_cache[100] = (...args) => (_ctx.openImportModal && _ctx.openImportModal(...args))),
                                    class: "rounded-lg border border-[#d8e0f3] dark:border-[#3b4c6f] px-3 py-2 text-xs font-semibold"
                                  }, _toDisplayString(_ctx.t('settings.import')), 1 /* TEXT */),
                                  _createElementVNode("button", {
                                    onClick: _cache[101] || (_cache[101] = (...args) => (_ctx.exportVaultJSON && _ctx.exportVaultJSON(...args))),
                                    class: "rounded-lg border border-[#d8e0f3] dark:border-[#3b4c6f] px-3 py-2 text-xs font-semibold"
                                  }, _toDisplayString(_ctx.t('settings.backup')), 1 /* TEXT */),
                                  _createElementVNode("button", {
                                    onClick: _cache[102] || (_cache[102] = (...args) => (_ctx.openSecuritySettingsModal && _ctx.openSecuritySettingsModal(...args))),
                                    class: "rounded-lg border border-[#d8e0f3] dark:border-[#3b4c6f] px-3 py-2 text-xs font-semibold"
                                  }, _toDisplayString(_ctx.t('settings.changePassword')), 1 /* TEXT */),
                                  _createElementVNode("button", {
                                    onClick: _cache[103] || (_cache[103] = (...args) => (_ctx.openTotpModal && _ctx.openTotpModal(...args))),
                                    class: "flex items-center justify-between gap-2 rounded-lg border border-[#d8e0f3] dark:border-[#3b4c6f] px-3 py-2 text-xs font-semibold"
                                  }, [
                                    _createElementVNode("span", null, _toDisplayString(_ctx.t('totp.title')), 1 /* TEXT */),
                                    (_ctx.totpStatus.loaded)
                                      ? (_openBlock(), _createElementBlock("span", {
                                          key: 0,
                                          class: _normalizeClass(['rounded px-1.5 py-0.5 text-[10px] font-semibold', _ctx.totpStatus.enabled ? 'bg-[#329371]/15 text-[#329371]' : 'bg-black/5 dark:bg-white/10 opacity-70'])
                                        }, _toDisplayString(_ctx.totpStatus.enabled ? _ctx.t('totp.badge.on') : _ctx.t('totp.badge.off')), 3 /* TEXT, CLASS */))
                                      : _createCommentVNode("v-if", true)
                                  ]),
                                  (_ctx.isAdmin)
                                    ? (_openBlock(), _createElementBlock("button", {
                                        key: 0,
                                        onClick: _cache[104] || (_cache[104] = (...args) => (_ctx.openAdminModal && _ctx.openAdminModal(...args))),
                                        class: "rounded-lg border border-[#d8e0f3] dark:border-[#3b4c6f] px-3 py-2 text-xs font-semibold"
                                      }, _toDisplayString(_ctx.t('settings.family')), 1 /* TEXT */))
                                    : _createCommentVNode("v-if", true),
                                  _createElementVNode("button", {
                                    onClick: _cache[105] || (_cache[105] = (...args) => (_ctx.openLogsModal && _ctx.openLogsModal(...args))),
                                    class: "rounded-lg border border-[#d8e0f3] dark:border-[#3b4c6f] px-3 py-2 text-xs font-semibold"
                                  }, _toDisplayString(_ctx.t('settings.logs')), 1 /* TEXT */)
                                ]),
                                _createElementVNode("div", _hoisted_371, [
                                  _createElementVNode("span", _hoisted_372, _toDisplayString(_ctx.t('settings.language')), 1 /* TEXT */),
                                  _createElementVNode("div", {
                                    class: "flex items-center gap-1",
                                    role: "group",
                                    "aria-label": _ctx.t('lang.label')
                                  }, [
                                    (_openBlock(), _createElementBlock(_Fragment, null, _renderList(['ru', 'en'], (l) => {
                                      return _createElementVNode("button", {
                                        key: l,
                                        onClick: $event => (_ctx.setLang(l)),
                                        "aria-pressed": _ctx.lang === l,
                                        title: _ctx.t('lang.name.' + l),
                                        class: _normalizeClass(['h-9 w-9 rounded-lg border text-[11px] font-semibold uppercase transition', _ctx.lang === l ? 'border-[#315bd7] bg-[#315bd7] text-white' : (_ctx.theme === 'dark' ? 'border-[#3b4c6f] bg-[#202d49] text-[#91d2ff]' : 'border-[#d8e0f3] bg-white text-[#536ca7]')])
                                      }, _toDisplayString(l), 11 /* TEXT, CLASS, PROPS */, _hoisted_374)
                                    }), 64 /* STABLE_FRAGMENT */))
                                  ], 8 /* PROPS */, _hoisted_373)
                                ])
                              ], 2 /* CLASS */),
                              _createElementVNode("div", {
                                class: _normalizeClass(['rounded-xl border p-4 sm:p-5 space-y-3', _ctx.theme === 'dark' ? 'border-[#324260] bg-[#1a2741]' : 'border-[#dce3f4] bg-[#fffefa]'])
                              }, [
                                _createElementVNode("h3", _hoisted_375, _toDisplayString(_ctx.t('nav.watchtower')), 1 /* TEXT */),
                                _createElementVNode("div", _hoisted_376, [
                                  (_openBlock(), _createElementBlock("svg", _hoisted_377, [
                                    _createElementVNode("g", _hoisted_378, [
                                      _createElementVNode("circle", {
                                        cx: "70",
                                        cy: "70",
                                        r: "52",
                                        fill: "none",
                                        "stroke-width": "14",
                                        stroke: _ctx.theme === 'dark' ? '#2a3b5e' : '#e3e9f8'
                                      }, null, 8 /* PROPS */, _hoisted_379),
                                      (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(_ctx.securityBreakdown.segs, (seg) => {
                                        return (_openBlock(), _createElementBlock(_Fragment, {
                                          key: seg.label
                                        }, [
                                          (seg.value > 0)
                                            ? (_openBlock(), _createElementBlock("circle", {
                                                key: 0,
                                                cx: "70",
                                                cy: "70",
                                                r: "52",
                                                fill: "none",
                                                "stroke-width": "14",
                                                stroke: seg.color,
                                                "stroke-dasharray": seg.dash,
                                                "stroke-dashoffset": seg.offset
                                              }, null, 8 /* PROPS */, _hoisted_380))
                                            : _createCommentVNode("v-if", true)
                                        ], 64 /* STABLE_FRAGMENT */))
                                      }), 128 /* KEYED_FRAGMENT */))
                                    ]),
                                    _createElementVNode("text", _hoisted_381, _toDisplayString(_ctx.securityScore) + "%", 1 /* TEXT */),
                                    _createElementVNode("text", _hoisted_382, _toDisplayString(_ctx.t('settings.protected')), 1 /* TEXT */)
                                  ])),
                                  _createElementVNode("div", _hoisted_383, [
                                    _createElementVNode("div", _hoisted_384, [
                                      _createElementVNode("span", _hoisted_385, [
                                        _hoisted_386,
                                        _createTextVNode(_toDisplayString(_ctx.t('settings.strong')), 1 /* TEXT */)
                                      ]),
                                      _createElementVNode("b", null, _toDisplayString(_ctx.securityBreakdown.segs[0].value), 1 /* TEXT */)
                                    ]),
                                    _createElementVNode("div", {
                                      class: "flex items-center justify-between gap-2 cursor-pointer",
                                      onClick: _cache[106] || (_cache[106] = $event => (_ctx.setFilter('all', 'reused', 'all')))
                                    }, [
                                      _createElementVNode("span", _hoisted_387, [
                                        _hoisted_388,
                                        _createTextVNode(_toDisplayString(_ctx.t('settings.reused')), 1 /* TEXT */)
                                      ]),
                                      _createElementVNode("b", _hoisted_389, _toDisplayString(_ctx.reusedCount), 1 /* TEXT */)
                                    ]),
                                    _createElementVNode("div", {
                                      class: "flex items-center justify-between gap-2 cursor-pointer",
                                      onClick: _cache[107] || (_cache[107] = $event => (_ctx.setFilter('all', 'weak', 'all')))
                                    }, [
                                      _createElementVNode("span", _hoisted_390, [
                                        _hoisted_391,
                                        _createTextVNode(_toDisplayString(_ctx.t('settings.weak')), 1 /* TEXT */)
                                      ]),
                                      _createElementVNode("b", _hoisted_392, _toDisplayString(_ctx.weakCount), 1 /* TEXT */)
                                    ])
                                  ])
                                ]),
                                _createElementVNode("div", {
                                  class: "flex justify-between text-xs pt-2 border-t border-black/5 dark:border-white/5 cursor-pointer",
                                  onClick: _cache[108] || (_cache[108] = (...args) => (_ctx.openDuplicatesView && _ctx.openDuplicatesView(...args)))
                                }, [
                                  _createElementVNode("span", null, _toDisplayString(_ctx.t('settings.dupGroups')), 1 /* TEXT */),
                                  _createTextVNode(),
                                  _createElementVNode("b", null, _toDisplayString(_ctx.duplicateGroups.length), 1 /* TEXT */)
                                ])
                              ], 2 /* CLASS */)
                            ])
                          ]))
                  ])),
              _createElementVNode("nav", {
                class: _normalizeClass(['safe-bottom-nav lg:hidden fixed bottom-0 inset-x-0 z-50 grid grid-cols-5 border-t backdrop-blur-md', _ctx.theme === 'dark' ? 'border-[#283653] bg-[#18243d]/95 text-[#91a2ca]' : 'border-[#dbe2f6] bg-[#fbfcff]/95 text-[#63769e]'])
              }, [
                _createElementVNode("button", {
                  onClick: _cache[109] || (_cache[109] = $event => (_ctx.setFilter('all', 'all', 'all'))),
                  class: _normalizeClass(['flex flex-col items-center justify-center gap-1 text-[10px] font-semibold', (_ctx.rightPaneMode === 'item' && !_ctx.mobileNavOpen) ? 'text-[#315bd7] dark:text-[#91d2ff]' : ''])
                }, [
                  _hoisted_393,
                  _createElementVNode("span", null, _toDisplayString(_ctx.t('bottom.items')), 1 /* TEXT */)
                ], 2 /* CLASS */),
                _createElementVNode("button", {
                  onClick: _cache[110] || (_cache[110] = $event => (_ctx.openHomeOverview())),
                  class: _normalizeClass(['flex flex-col items-center justify-center gap-1 text-[10px] font-semibold', _ctx.rightPaneMode === 'home' ? 'text-[#315bd7] dark:text-[#91d2ff]' : ''])
                }, [
                  _hoisted_394,
                  _createElementVNode("span", null, _toDisplayString(_ctx.t('bottom.folders')), 1 /* TEXT */)
                ], 2 /* CLASS */),
                _createElementVNode("button", {
                  onClick: _cache[111] || (_cache[111] = $event => (_ctx.openItemModal(null))),
                  class: "flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-[#315bd7] dark:text-[#f4c96b]"
                }, [
                  _hoisted_395,
                  _createElementVNode("span", null, _toDisplayString(_ctx.t('bottom.add')), 1 /* TEXT */)
                ]),
                _createElementVNode("button", {
                  onClick: _cache[112] || (_cache[112] = $event => (_ctx.openDuplicatesView())),
                  class: _normalizeClass(['flex flex-col items-center justify-center gap-1 text-[10px] font-semibold', _ctx.rightPaneMode === 'duplicates' ? 'text-[#315bd7] dark:text-[#91d2ff]' : ''])
                }, [
                  _hoisted_396,
                  _createElementVNode("span", null, _toDisplayString(_ctx.t('bottom.duplicates')), 1 /* TEXT */)
                ], 2 /* CLASS */),
                _createElementVNode("button", {
                  onClick: _cache[113] || (_cache[113] = $event => (_ctx.mobileNavOpen = !_ctx.mobileNavOpen)),
                  class: _normalizeClass(['flex flex-col items-center justify-center gap-1 text-[10px] font-semibold', _ctx.mobileNavOpen ? 'text-[#315bd7] dark:text-[#91d2ff]' : ''])
                }, [
                  _hoisted_397,
                  _createElementVNode("span", null, _toDisplayString(_ctx.t('header.menu')), 1 /* TEXT */)
                ], 2 /* CLASS */)
              ], 2 /* CLASS */)
            ])
          ])),
    (_ctx.showItemModal)
      ? (_openBlock(), _createElementBlock("div", {
          key: 3,
          class: "fixed inset-0 z-[90] flex items-center justify-center bg-[#17221d]/55 p-3.5 backdrop-blur-[3px]",
          onMousedown: _cache[141] || (_cache[141] = _withModifiers($event => (_ctx.showItemModal = false), ["self"]))
        }, [
          _createElementVNode("div", {
            class: _normalizeClass(['w-full max-w-[480px] max-h-[88dvh] overflow-y-auto rounded-2xl border p-5 sm:p-6 shadow-2xl', _ctx.theme === 'dark' ? 'border-[#3c4e73] bg-[#202d49] text-[#edf1ff]' : 'border-[#dce3f4] bg-[#fffefa] text-[#263756]'])
          }, [
            _createElementVNode("div", _hoisted_398, [
              _createElementVNode("div", null, [
                _createElementVNode("h3", _hoisted_399, _toDisplayString(_ctx.editingItem ? _ctx.t('item.editTitle') : _ctx.t('item.new')), 1 /* TEXT */),
                _createElementVNode("p", {
                  class: _normalizeClass(['mt-0.5 text-[10.5px]', _ctx.theme === 'dark' ? 'text-[#aab8d5]' : 'text-[#7281a4]'])
                }, _toDisplayString(_ctx.t('item.encryptedLocally')), 3 /* TEXT, CLASS */)
              ]),
              _createElementVNode("button", {
                onClick: _cache[114] || (_cache[114] = $event => (_ctx.showItemModal = false)),
                "aria-label": _ctx.t('common.close'),
                class: "grid h-8 w-8 place-items-center rounded-lg opacity-70 hover:opacity-100"
              }, _hoisted_402, 8 /* PROPS */, _hoisted_400)
            ]),
            _createElementVNode("div", _hoisted_403, [
              _createElementVNode("label", _hoisted_404, [
                _createTextVNode(_toDisplayString(_ctx.t('item.type')) + " ", 1 /* TEXT */),
                _withDirectives(_createElementVNode("select", {
                  "onUpdate:modelValue": _cache[115] || (_cache[115] = $event => ((_ctx.itemForm.itemType) = $event)),
                  onChange: _cache[116] || (_cache[116] = (...args) => (_ctx.onItemTypeChange && _ctx.onItemTypeChange(...args))),
                  class: _normalizeClass(['mt-1 h-9 w-full rounded-lg border px-2 text-[11px] outline-none', _ctx.theme === 'dark' ? 'border-[#3b4d70] bg-[#18243d] text-white' : 'border-[#d8e0f3] bg-white text-[#263756]'])
                }, [
                  _createElementVNode("option", _hoisted_405, _toDisplayString(_ctx.t('item.type.login')), 1 /* TEXT */),
                  _createElementVNode("option", _hoisted_406, _toDisplayString(_ctx.t('item.type.card')), 1 /* TEXT */),
                  _createElementVNode("option", _hoisted_407, _toDisplayString(_ctx.t('item.type.discount')), 1 /* TEXT */),
                  _createElementVNode("option", _hoisted_408, _toDisplayString(_ctx.t('item.type.wifi')), 1 /* TEXT */),
                  _createElementVNode("option", _hoisted_409, _toDisplayString(_ctx.t('item.type.note')), 1 /* TEXT */)
                ], 34 /* CLASS, HYDRATE_EVENTS */), [
                  [_vModelSelect, _ctx.itemForm.itemType]
                ])
              ]),
              _createElementVNode("label", _hoisted_410, [
                _createTextVNode(_toDisplayString(_ctx.t('item.folder')) + " ", 1 /* TEXT */),
                _withDirectives(_createElementVNode("select", {
                  "onUpdate:modelValue": _cache[117] || (_cache[117] = $event => ((_ctx.itemForm.folder) = $event)),
                  class: _normalizeClass(['mt-1 h-9 w-full rounded-lg border px-2 text-[11px] outline-none', _ctx.theme === 'dark' ? 'border-[#3b4d70] bg-[#18243d] text-white' : 'border-[#d8e0f3] bg-white text-[#263756]'])
                }, [
                  _createElementVNode("option", _hoisted_411, _toDisplayString(_ctx.t('item.autoNoFolder')), 1 /* TEXT */),
                  (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(_ctx.allFolders, (f) => {
                    return (_openBlock(), _createElementBlock("option", {
                      key: f.id,
                      value: f.id
                    }, _toDisplayString(f.name), 9 /* TEXT, PROPS */, _hoisted_412))
                  }), 128 /* KEYED_FRAGMENT */))
                ], 2 /* CLASS */), [
                  [_vModelSelect, _ctx.itemForm.folder]
                ])
              ]),
              _createElementVNode("label", _hoisted_413, [
                _createTextVNode(_toDisplayString(_ctx.t('item.scope')) + " ", 1 /* TEXT */),
                _withDirectives(_createElementVNode("select", {
                  "onUpdate:modelValue": _cache[118] || (_cache[118] = $event => ((_ctx.itemForm.scope) = $event)),
                  class: _normalizeClass(['mt-1 h-9 w-full rounded-lg border px-2 text-[11px] outline-none', _ctx.theme === 'dark' ? 'border-[#3b4d70] bg-[#18243d] text-white' : 'border-[#d8e0f3] bg-white text-[#263756]'])
                }, [
                  _createElementVNode("option", _hoisted_414, _toDisplayString(_ctx.t('nav.personal')), 1 /* TEXT */),
                  _createElementVNode("option", _hoisted_415, _toDisplayString(_ctx.t('nav.family')), 1 /* TEXT */)
                ], 2 /* CLASS */), [
                  [_vModelSelect, _ctx.itemForm.scope]
                ])
              ])
            ]),
            _createElementVNode("label", _hoisted_416, [
              _createTextVNode(_toDisplayString(_ctx.t(_ctx.itemForm.itemType === 'login' ? 'item.titleLabel' : 'item.titleLabel.' + _ctx.itemForm.itemType)) + " ", 1 /* TEXT */),
              _withDirectives(_createElementVNode("input", {
                "onUpdate:modelValue": _cache[119] || (_cache[119] = $event => ((_ctx.itemForm.title) = $event)),
                placeholder: _ctx.t(_ctx.itemForm.itemType === 'login' ? 'item.titlePlaceholder' : 'item.titlePlaceholder.' + _ctx.itemForm.itemType),
                class: _normalizeClass(['mt-1 h-10 w-full rounded-lg border px-3 text-[12px] font-normal outline-none focus:border-[#6d8df0]', _ctx.theme === 'dark' ? 'border-[#3b4d70] bg-[#18243d] text-white' : 'border-[#d8e0f3] bg-white text-[#263756]'])
              }, null, 10 /* CLASS, PROPS */, _hoisted_417), [
                [_vModelText, _ctx.itemForm.title]
              ])
            ]),
            (_ctx.itemForm.itemType === 'card')
              ? (_openBlock(), _createElementBlock(_Fragment, { key: 0 }, [
                  _createElementVNode("label", _hoisted_418, [
                    _createTextVNode(_toDisplayString(_ctx.t('item.card.number')) + " ", 1 /* TEXT */),
                    _createElementVNode("input", {
                      value: _ctx.itemForm.username,
                      onInput: _cache[120] || (_cache[120] = (...args) => (_ctx.onCardNumberInput && _ctx.onCardNumberInput(...args))),
                      inputmode: "numeric",
                      autocomplete: "off",
                      placeholder: "0000 0000 0000 0000",
                      class: _normalizeClass(['font-mono mt-1 h-10 w-full rounded-lg border px-3 text-[12px] font-normal outline-none focus:border-[#6d8df0]', _ctx.theme === 'dark' ? 'border-[#3b4d70] bg-[#18243d] text-white' : 'border-[#d8e0f3] bg-white text-[#263756]'])
                    }, null, 42 /* CLASS, PROPS, HYDRATE_EVENTS */, _hoisted_419),
                    (_ctx.cardWarn.number)
                      ? (_openBlock(), _createElementBlock("p", _hoisted_420, _toDisplayString(_ctx.t('item.warn.cardNumber')), 1 /* TEXT */))
                      : _createCommentVNode("v-if", true)
                  ]),
                  _createElementVNode("div", _hoisted_421, [
                    _createElementVNode("label", _hoisted_422, [
                      _createTextVNode(_toDisplayString(_ctx.t('item.card.expiry')) + " ", 1 /* TEXT */),
                      _createElementVNode("input", {
                        value: _ctx.cardForm.expiry,
                        onInput: _cache[121] || (_cache[121] = (...args) => (_ctx.onCardExpiryInput && _ctx.onCardExpiryInput(...args))),
                        inputmode: "numeric",
                        autocomplete: "off",
                        placeholder: "07/27",
                        maxlength: "5",
                        class: _normalizeClass(['font-mono mt-1 h-10 w-full rounded-lg border px-3 text-[12px] font-normal outline-none focus:border-[#6d8df0]', _ctx.theme === 'dark' ? 'border-[#3b4d70] bg-[#18243d] text-white' : 'border-[#d8e0f3] bg-white text-[#263756]'])
                      }, null, 42 /* CLASS, PROPS, HYDRATE_EVENTS */, _hoisted_423),
                      (_ctx.cardWarn.expiry)
                        ? (_openBlock(), _createElementBlock("p", _hoisted_424, _toDisplayString(_ctx.t('item.warn.cardExpiry')), 1 /* TEXT */))
                        : _createCommentVNode("v-if", true)
                    ]),
                    _createElementVNode("label", _hoisted_425, [
                      _createTextVNode(_toDisplayString(_ctx.t('item.card.cvv')) + " ", 1 /* TEXT */),
                      _createElementVNode("div", _hoisted_426, [
                        _createElementVNode("input", {
                          type: _ctx.showModalPwd ? 'text' : 'password',
                          value: _ctx.itemForm.password,
                          onInput: _cache[122] || (_cache[122] = (...args) => (_ctx.onCardCvvInput && _ctx.onCardCvvInput(...args))),
                          inputmode: "numeric",
                          autocomplete: "off",
                          maxlength: "4",
                          placeholder: "•••",
                          class: _normalizeClass(['h-10 min-w-0 flex-1 rounded-lg border px-3 font-mono text-[12px] font-normal outline-none focus:border-[#6d8df0]', _ctx.theme === 'dark' ? 'border-[#3b4d70] bg-[#18243d] text-white' : 'border-[#d8e0f3] bg-white text-[#263756]'])
                        }, null, 42 /* CLASS, PROPS, HYDRATE_EVENTS */, _hoisted_427),
                        _createElementVNode("button", {
                          type: "button",
                          onClick: _cache[123] || (_cache[123] = $event => (_ctx.showModalPwd = !_ctx.showModalPwd)),
                          "aria-label": _ctx.t(_ctx.showModalPwd ? 'common.hidePassword' : 'common.showPassword'),
                          class: "h-10 w-10 shrink-0 rounded-lg border border-[#d8e0f3] dark:border-[#3b4d70]"
                        }, [
                          _createElementVNode("i", {
                            class: _normalizeClass(_ctx.showModalPwd ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye')
                          }, null, 2 /* CLASS */)
                        ], 8 /* PROPS */, _hoisted_428)
                      ]),
                      (_ctx.cardWarn.cvv)
                        ? (_openBlock(), _createElementBlock("p", _hoisted_429, _toDisplayString(_ctx.t('item.warn.cardCvv')), 1 /* TEXT */))
                        : _createCommentVNode("v-if", true)
                    ])
                  ]),
                  _createElementVNode("label", _hoisted_430, [
                    _createTextVNode(_toDisplayString(_ctx.t('item.card.holder')) + " ", 1 /* TEXT */),
                    _withDirectives(_createElementVNode("input", {
                      "onUpdate:modelValue": _cache[124] || (_cache[124] = $event => ((_ctx.cardForm.holder) = $event)),
                      autocomplete: "off",
                      placeholder: _ctx.t('item.card.holderPlaceholder'),
                      class: _normalizeClass(['mt-1 h-10 w-full rounded-lg border px-3 text-[12px] font-normal outline-none focus:border-[#6d8df0]', _ctx.theme === 'dark' ? 'border-[#3b4d70] bg-[#18243d] text-white' : 'border-[#d8e0f3] bg-white text-[#263756]'])
                    }, null, 10 /* CLASS, PROPS */, _hoisted_431), [
                      [_vModelText, _ctx.cardForm.holder]
                    ])
                  ]),
                  _createElementVNode("label", _hoisted_432, [
                    _createTextVNode(_toDisplayString(_ctx.t('item.card.pin')) + " ", 1 /* TEXT */),
                    _createElementVNode("input", {
                      type: _ctx.showModalPwd ? 'text' : 'password',
                      value: _ctx.cardForm.pin,
                      onInput: _cache[125] || (_cache[125] = (...args) => (_ctx.onCardPinInput && _ctx.onCardPinInput(...args))),
                      inputmode: "numeric",
                      autocomplete: "off",
                      maxlength: "8",
                      placeholder: "••••",
                      class: _normalizeClass(['font-mono mt-1 h-10 w-full rounded-lg border px-3 text-[12px] font-normal outline-none focus:border-[#6d8df0]', _ctx.theme === 'dark' ? 'border-[#3b4d70] bg-[#18243d] text-white' : 'border-[#d8e0f3] bg-white text-[#263756]'])
                    }, null, 42 /* CLASS, PROPS, HYDRATE_EVENTS */, _hoisted_433)
                  ])
                ], 64 /* STABLE_FRAGMENT */))
              : (_ctx.itemForm.itemType === 'discount')
                ? (_openBlock(), _createElementBlock(_Fragment, { key: 1 }, [
                    _createElementVNode("label", _hoisted_434, [
                      _createTextVNode(_toDisplayString(_ctx.t('item.discount.number')) + " ", 1 /* TEXT */),
                      _withDirectives(_createElementVNode("input", {
                        "onUpdate:modelValue": _cache[126] || (_cache[126] = $event => ((_ctx.itemForm.username) = $event)),
                        autocomplete: "off",
                        placeholder: "4600000000000",
                        class: _normalizeClass(['font-mono mt-1 h-10 w-full rounded-lg border px-3 text-[12px] font-normal outline-none focus:border-[#6d8df0]', _ctx.theme === 'dark' ? 'border-[#3b4d70] bg-[#18243d] text-white' : 'border-[#d8e0f3] bg-white text-[#263756]'])
                      }, null, 2 /* CLASS */), [
                        [_vModelText, _ctx.itemForm.username]
                      ]),
                      (_ctx.discountCheck && _ctx.discountCheck.error)
                        ? (_openBlock(), _createElementBlock("p", _hoisted_435, _toDisplayString(_ctx.discountErrorText(_ctx.discountCheck)), 1 /* TEXT */))
                        : (_ctx.discountCheck)
                          ? (_openBlock(), _createElementBlock("p", {
                              key: 1,
                              class: _normalizeClass(['mt-1 text-[10px] font-normal', _ctx.theme === 'dark' ? 'text-[#aab8d5]' : 'text-[#7281a4]'])
                            }, _toDisplayString(_ctx.t('item.discount.willShowAs', { format: _ctx.t('discount.format.' + _ctx.discountCheck.format) })), 3 /* TEXT, CLASS */))
                          : _createCommentVNode("v-if", true)
                    ]),
                    _createElementVNode("div", _hoisted_436, [
                      _createElementVNode("label", _hoisted_437, [
                        _createTextVNode(_toDisplayString(_ctx.t('item.discount.format')) + " ", 1 /* TEXT */),
                        _withDirectives(_createElementVNode("select", {
                          "onUpdate:modelValue": _cache[127] || (_cache[127] = $event => ((_ctx.discountForm.format) = $event)),
                          class: _normalizeClass(['mt-1 h-10 w-full rounded-lg border px-2 text-[12px] font-normal outline-none', _ctx.theme === 'dark' ? 'border-[#3b4d70] bg-[#18243d] text-white' : 'border-[#d8e0f3] bg-white text-[#263756]'])
                        }, [
                          (_openBlock(), _createElementBlock(_Fragment, null, _renderList(['auto', 'ean13', 'ean8', 'code128', 'code39', 'qr'], (f) => {
                            return _createElementVNode("option", {
                              key: f,
                              value: f
                            }, _toDisplayString(_ctx.t('discount.format.' + f)), 9 /* TEXT, PROPS */, _hoisted_438)
                          }), 64 /* STABLE_FRAGMENT */))
                        ], 2 /* CLASS */), [
                          [_vModelSelect, _ctx.discountForm.format]
                        ])
                      ]),
                      _createElementVNode("label", _hoisted_439, [
                        _createTextVNode(_toDisplayString(_ctx.t('item.discount.expiry')) + " ", 1 /* TEXT */),
                        _withDirectives(_createElementVNode("input", {
                          "onUpdate:modelValue": _cache[128] || (_cache[128] = $event => ((_ctx.discountForm.expiry) = $event)),
                          autocomplete: "off",
                          maxlength: "20",
                          placeholder: _ctx.t('item.discount.expiryPlaceholder'),
                          class: _normalizeClass(['mt-1 h-10 w-full rounded-lg border px-3 text-[12px] font-normal outline-none focus:border-[#6d8df0]', _ctx.theme === 'dark' ? 'border-[#3b4d70] bg-[#18243d] text-white' : 'border-[#d8e0f3] bg-white text-[#263756]'])
                        }, null, 10 /* CLASS, PROPS */, _hoisted_440), [
                          [_vModelText, _ctx.discountForm.expiry]
                        ])
                      ])
                    ]),
                    _createElementVNode("div", _hoisted_441, [
                      _createElementVNode("div", _hoisted_442, _toDisplayString(_ctx.t('item.discount.color')), 1 /* TEXT */),
                      _createElementVNode("div", _hoisted_443, [
                        (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(_ctx.discountPalettes, (p, pi) => {
                          return (_openBlock(), _createElementBlock("button", {
                            key: p.id,
                            type: "button",
                            onClick: $event => (_ctx.discountForm.color = p.id),
                            "aria-label": _ctx.t('item.discount.colorOption', { n: pi + 1 }),
                            "aria-pressed": _ctx.formPaletteId === p.id,
                            class: _normalizeClass(['h-7 w-7 rounded-full ring-offset-2 transition', _ctx.theme === 'dark' ? 'ring-offset-[#18243d]' : 'ring-offset-white', _ctx.formPaletteId === p.id ? 'ring-2 ring-[#6d8df0]' : 'ring-1 ring-black/10']),
                            style: _normalizeStyle({ background: 'linear-gradient(135deg, ' + p.from + ', ' + p.to + ')' })
                          }, null, 14 /* CLASS, STYLE, PROPS */, _hoisted_444))
                        }), 128 /* KEYED_FRAGMENT */))
                      ])
                    ]),
                    _createElementVNode("div", _hoisted_445, [
                      _createElementVNode("div", _hoisted_446, _toDisplayString(_ctx.t('item.discount.photo')), 1 /* TEXT */),
                      _createElementVNode("div", _hoisted_447, [
                        (_ctx.discountForm.photo)
                          ? (_openBlock(), _createElementBlock("img", {
                              key: 0,
                              src: _ctx.discountForm.photo,
                              alt: _ctx.t('item.discount.photoAlt'),
                              class: "h-12 w-[76px] rounded-lg object-cover ring-1 ring-black/10"
                            }, null, 8 /* PROPS */, _hoisted_448))
                          : _createCommentVNode("v-if", true),
                        _createElementVNode("label", {
                          class: _normalizeClass(['flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border px-3 text-[11px] font-semibold', _ctx.theme === 'dark' ? 'border-[#3b4d70] text-[#91d2ff]' : 'border-[#d8e0f3] text-[#315bd7]', _ctx.discountPhotoBusy ? 'pointer-events-none opacity-60' : ''])
                        }, [
                          _hoisted_449,
                          _createTextVNode(" " + _toDisplayString(_ctx.discountPhotoBusy ? _ctx.t('item.discount.photoBusy') : (_ctx.discountForm.photo ? _ctx.t('item.discount.photoChange') : _ctx.t('item.discount.photo'))) + " ", 1 /* TEXT */),
                          _createElementVNode("input", {
                            type: "file",
                            accept: "image/*",
                            class: "hidden",
                            onChange: _cache[129] || (_cache[129] = (...args) => (_ctx.onDiscountPhotoPick && _ctx.onDiscountPhotoPick(...args))),
                            disabled: _ctx.discountPhotoBusy
                          }, null, 40 /* PROPS, HYDRATE_EVENTS */, _hoisted_450)
                        ], 2 /* CLASS */),
                        (_ctx.discountForm.photo)
                          ? (_openBlock(), _createElementBlock("button", {
                              key: 1,
                              type: "button",
                              onClick: _cache[130] || (_cache[130] = (...args) => (_ctx.removeDiscountPhoto && _ctx.removeDiscountPhoto(...args))),
                              class: "flex h-9 items-center gap-1.5 rounded-lg border border-[#e11d48]/30 px-3 text-[11px] font-semibold text-[#e11d48]"
                            }, [
                              _hoisted_451,
                              _createTextVNode(" " + _toDisplayString(_ctx.t('item.discount.photoRemove')), 1 /* TEXT */)
                            ]))
                          : _createCommentVNode("v-if", true)
                      ]),
                      (_ctx.discountPhotoError)
                        ? (_openBlock(), _createElementBlock("p", _hoisted_452, _toDisplayString(_ctx.discountPhotoError), 1 /* TEXT */))
                        : (_openBlock(), _createElementBlock("p", {
                            key: 1,
                            class: _normalizeClass(['mt-1 text-[10px] font-normal', _ctx.theme === 'dark' ? 'text-[#aab8d5]' : 'text-[#7281a4]'])
                          }, _toDisplayString(_ctx.t('item.discount.photoHint')), 3 /* TEXT, CLASS */))
                    ])
                  ], 64 /* STABLE_FRAGMENT */))
                : (_ctx.itemForm.itemType !== 'note')
                  ? (_openBlock(), _createElementBlock(_Fragment, { key: 2 }, [
                      _createElementVNode("label", _hoisted_453, [
                        _createTextVNode(_toDisplayString(_ctx.t('item.usernameLabel.' + _ctx.itemForm.itemType)) + " ", 1 /* TEXT */),
                        _withDirectives(_createElementVNode("input", {
                          "onUpdate:modelValue": _cache[131] || (_cache[131] = $event => ((_ctx.itemForm.username) = $event)),
                          placeholder: _ctx.itemForm.itemType === 'login' ? 'name@example.ru' : '',
                          class: _normalizeClass(['mt-1 h-10 w-full rounded-lg border px-3 text-[12px] font-normal outline-none focus:border-[#6d8df0]', _ctx.theme === 'dark' ? 'border-[#3b4d70] bg-[#18243d] text-white' : 'border-[#d8e0f3] bg-white text-[#263756]'])
                        }, null, 10 /* CLASS, PROPS */, _hoisted_454), [
                          [_vModelText, _ctx.itemForm.username]
                        ])
                      ]),
                      _createElementVNode("label", _hoisted_455, [
                        _createTextVNode(_toDisplayString(_ctx.t('item.passwordLabel.' + _ctx.itemForm.itemType)) + " ", 1 /* TEXT */),
                        _createElementVNode("div", _hoisted_456, [
                          _withDirectives(_createElementVNode("input", {
                            type: _ctx.showModalPwd ? 'text' : 'password',
                            "onUpdate:modelValue": _cache[132] || (_cache[132] = $event => ((_ctx.itemForm.password) = $event)),
                            placeholder: _ctx.t('item.passwordPlaceholder'),
                            class: _normalizeClass(['h-10 flex-1 rounded-lg border px-3 font-mono text-[12px] font-normal outline-none focus:border-[#6d8df0]', _ctx.theme === 'dark' ? 'border-[#3b4d70] bg-[#18243d] text-white' : 'border-[#d8e0f3] bg-white text-[#263756]'])
                          }, null, 10 /* CLASS, PROPS */, _hoisted_457), [
                            [_vModelDynamic, _ctx.itemForm.password]
                          ]),
                          _createElementVNode("button", {
                            type: "button",
                            onClick: _cache[133] || (_cache[133] = $event => (_ctx.showModalPwd = !_ctx.showModalPwd)),
                            "aria-label": _ctx.t(_ctx.showModalPwd ? 'common.hidePassword' : 'common.showPassword'),
                            class: "h-10 w-10 rounded-lg border border-[#d8e0f3] dark:border-[#3b4d70]"
                          }, [
                            _createElementVNode("i", {
                              class: _normalizeClass(_ctx.showModalPwd ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye')
                            }, null, 2 /* CLASS */)
                          ], 8 /* PROPS */, _hoisted_458),
                          _createElementVNode("button", {
                            type: "button",
                            onClick: _cache[134] || (_cache[134] = (...args) => (_ctx.generatePasswordIntoForm && _ctx.generatePasswordIntoForm(...args))),
                            title: _ctx.t('gen.generate'),
                            "aria-label": _ctx.t('gen.generate'),
                            class: "h-10 w-10 rounded-lg border border-[#d8e0f3] dark:border-[#3b4d70]"
                          }, _hoisted_461, 8 /* PROPS */, _hoisted_459)
                        ])
                      ])
                    ], 64 /* STABLE_FRAGMENT */))
                  : _createCommentVNode("v-if", true),
            (_ctx.itemForm.itemType === 'login')
              ? (_openBlock(), _createElementBlock("label", _hoisted_462, [
                  _createTextVNode(_toDisplayString(_ctx.t('item.urlLabel')) + " ", 1 /* TEXT */),
                  _withDirectives(_createElementVNode("input", {
                    "onUpdate:modelValue": _cache[135] || (_cache[135] = $event => ((_ctx.itemForm.url) = $event)),
                    placeholder: "https://example.ru",
                    class: _normalizeClass(['mt-1 h-10 w-full rounded-lg border px-3 text-[12px] font-normal outline-none focus:border-[#6d8df0]', _ctx.theme === 'dark' ? 'border-[#3b4d70] bg-[#18243d] text-white' : 'border-[#d8e0f3] bg-white text-[#263756]'])
                  }, null, 2 /* CLASS */), [
                    [_vModelText, _ctx.itemForm.url]
                  ]),
                  (_ctx.loginWarn.url)
                    ? (_openBlock(), _createElementBlock("p", _hoisted_463, _toDisplayString(_ctx.t('item.warn.url')), 1 /* TEXT */))
                    : _createCommentVNode("v-if", true)
                ]))
              : _createCommentVNode("v-if", true),
            (_ctx.itemForm.itemType === 'login')
              ? (_openBlock(), _createElementBlock("label", _hoisted_464, [
                  _createTextVNode(_toDisplayString(_ctx.t('item.totpLabel')) + " ", 1 /* TEXT */),
                  _withDirectives(_createElementVNode("input", {
                    "onUpdate:modelValue": _cache[136] || (_cache[136] = $event => ((_ctx.itemForm.totpSecret) = $event)),
                    placeholder: "JBSWY3DPEHPK3PXP",
                    class: _normalizeClass(['mt-1 h-9 w-full rounded-lg border px-3 font-mono text-[11px] font-normal outline-none', _ctx.theme === 'dark' ? 'border-[#3b4d70] bg-[#18243d] text-white' : 'border-[#d8e0f3] bg-white text-[#263756]'])
                  }, null, 2 /* CLASS */), [
                    [_vModelText, _ctx.itemForm.totpSecret]
                  ]),
                  (_ctx.loginWarn.totp)
                    ? (_openBlock(), _createElementBlock("p", _hoisted_465, _toDisplayString(_ctx.t('item.warn.totp')), 1 /* TEXT */))
                    : _createCommentVNode("v-if", true)
                ]))
              : _createCommentVNode("v-if", true),
            _createElementVNode("label", _hoisted_466, [
              _createTextVNode(_toDisplayString(_ctx.t('item.note')) + " ", 1 /* TEXT */),
              _withDirectives(_createElementVNode("textarea", {
                "onUpdate:modelValue": _cache[137] || (_cache[137] = $event => ((_ctx.itemForm.note) = $event)),
                rows: "3",
                class: _normalizeClass(['mt-1 w-full rounded-lg border p-2.5 text-[12px] font-normal outline-none', _ctx.theme === 'dark' ? 'border-[#3b4d70] bg-[#18243d] text-white' : 'border-[#d8e0f3] bg-white text-[#263756]'])
              }, null, 2 /* CLASS */), [
                [_vModelText, _ctx.itemForm.note]
              ])
            ]),
            _createElementVNode("div", _hoisted_467, [
              _createElementVNode("div", _hoisted_468, [
                _createElementVNode("span", _hoisted_469, _toDisplayString(_ctx.t('item.customFields')), 1 /* TEXT */),
                _createElementVNode("button", {
                  type: "button",
                  onClick: _cache[138] || (_cache[138] = $event => (_ctx.itemForm.customFields.push({ label: '', value: '' }))),
                  class: "text-[11px] font-semibold text-[#315bd7] dark:text-[#91d2ff]"
                }, _toDisplayString(_ctx.t('item.addField')), 1 /* TEXT */)
              ]),
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(_ctx.itemForm.customFields, (cf, idx) => {
                return (_openBlock(), _createElementBlock("div", {
                  key: idx,
                  class: "flex gap-1.5"
                }, [
                  _withDirectives(_createElementVNode("input", {
                    "onUpdate:modelValue": $event => ((cf.label) = $event),
                    placeholder: _ctx.t('item.fieldNamePlaceholder'),
                    class: _normalizeClass(['h-8 w-1/3 rounded-lg border px-2 text-xs', _ctx.theme === 'dark' ? 'border-[#3b4d70] bg-[#18243d]' : 'border-[#d8e0f3] bg-white'])
                  }, null, 10 /* CLASS, PROPS */, _hoisted_470), [
                    [_vModelText, cf.label]
                  ]),
                  _withDirectives(_createElementVNode("input", {
                    "onUpdate:modelValue": $event => ((cf.value) = $event),
                    placeholder: _ctx.t('item.fieldValuePlaceholder'),
                    class: _normalizeClass(['h-8 flex-1 rounded-lg border px-2 text-xs', _ctx.theme === 'dark' ? 'border-[#3b4d70] bg-[#18243d]' : 'border-[#d8e0f3] bg-white'])
                  }, null, 10 /* CLASS, PROPS */, _hoisted_471), [
                    [_vModelText, cf.value]
                  ]),
                  _createElementVNode("button", {
                    type: "button",
                    onClick: $event => (_ctx.itemForm.customFields.splice(idx, 1)),
                    "aria-label": _ctx.t('item.removeField'),
                    class: "h-8 w-8 rounded-lg border text-[#e11d48]"
                  }, _hoisted_474, 8 /* PROPS */, _hoisted_472)
                ]))
              }), 128 /* KEYED_FRAGMENT */))
            ]),
            _createElementVNode("div", _hoisted_475, [
              _createElementVNode("button", {
                onClick: _cache[139] || (_cache[139] = $event => (_ctx.showItemModal = false)),
                class: "h-9 rounded-lg border px-4 text-[11px] font-semibold"
              }, _toDisplayString(_ctx.t('common.cancel')), 1 /* TEXT */),
              _createElementVNode("button", {
                onClick: _cache[140] || (_cache[140] = (...args) => (_ctx.saveItem && _ctx.saveItem(...args))),
                class: "h-9 rounded-lg bg-[#315bd7] px-5 text-[11px] font-semibold text-white"
              }, _toDisplayString(_ctx.t('common.save')), 1 /* TEXT */)
            ])
          ], 2 /* CLASS */)
        ], 32 /* HYDRATE_EVENTS */))
      : _createCommentVNode("v-if", true),
    (_ctx.showGenModal)
      ? (_openBlock(), _createElementBlock("div", {
          key: 4,
          class: "fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4",
          onMousedown: _cache[147] || (_cache[147] = _withModifiers($event => (_ctx.showGenModal = false), ["self"]))
        }, [
          _createElementVNode("div", {
            class: _normalizeClass(['w-full max-w-md rounded-2xl border p-6', _ctx.theme === 'dark' ? 'border-[#3c4e73] bg-[#202d49]' : 'border-[#dce3f4] bg-[#fffefa]'])
          }, [
            _createElementVNode("div", _hoisted_476, [
              _createElementVNode("h3", _hoisted_477, _toDisplayString(_ctx.t('settings.generator')), 1 /* TEXT */),
              _createElementVNode("button", {
                onClick: _cache[142] || (_cache[142] = $event => (_ctx.showGenModal = false)),
                "aria-label": _ctx.t('common.close'),
                class: "opacity-70 hover:opacity-100"
              }, _hoisted_480, 8 /* PROPS */, _hoisted_478)
            ]),
            _createElementVNode("div", {
              class: _normalizeClass(["rounded-xl border p-3.5 font-mono text-center text-sm font-bold break-all mb-3 select-text", _ctx.theme === 'dark' ? 'border-[#3b4d70] bg-[#18243d]' : 'border-[#d8e0f3] bg-[#f8faff]'])
            }, _toDisplayString(_ctx.generatedPasswordString), 3 /* TEXT, CLASS */),
            _createElementVNode("div", _hoisted_481, [
              _createElementVNode("div", _hoisted_482, [
                _createElementVNode("span", null, [
                  _createTextVNode(_toDisplayString(_ctx.t('gen.strength')) + " ", 1 /* TEXT */),
                  _createElementVNode("span", {
                    style: _normalizeStyle({ color: _ctx.genStrength.color })
                  }, _toDisplayString(_ctx.genStrength.label), 5 /* TEXT, STYLE */)
                ]),
                _createElementVNode("span", _hoisted_483, _toDisplayString(_ctx.t('gen.bits', { n: _ctx.genStrength.bits })), 1 /* TEXT */)
              ]),
              _createElementVNode("div", _hoisted_484, [
                _createElementVNode("div", {
                  class: "h-full rounded-full transition-all",
                  style: _normalizeStyle({ width: _ctx.genStrength.percent + '%', backgroundColor: _ctx.genStrength.color })
                }, null, 4 /* STYLE */)
              ])
            ]),
            _createElementVNode("div", _hoisted_485, [
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(_ctx.genOptionList, (opt) => {
                return (_openBlock(), _createElementBlock("button", {
                  key: opt.key,
                  onClick: $event => (_ctx.toggleGenOpt(opt.key)),
                  class: _normalizeClass(['h-9 rounded-lg border font-mono text-[11px] font-semibold transition', _ctx.genOpts[opt.key] ? 'border-[#315bd7] bg-[#315bd7] text-white' : 'border-[#d8e0f3] dark:border-[#3b4c6f]'])
                }, _toDisplayString(opt.label), 11 /* TEXT, CLASS, PROPS */, _hoisted_486))
              }), 128 /* KEYED_FRAGMENT */))
            ]),
            _createElementVNode("div", _hoisted_487, [
              _createElementVNode("span", null, _toDisplayString(_ctx.t('gen.length')), 1 /* TEXT */),
              _createElementVNode("span", _hoisted_488, _toDisplayString(_ctx.genLength), 1 /* TEXT */)
            ]),
            _withDirectives(_createElementVNode("input", {
              type: "range",
              min: "8",
              max: "64",
              "onUpdate:modelValue": _cache[143] || (_cache[143] = $event => ((_ctx.genLength) = $event)),
              onInput: _cache[144] || (_cache[144] = (...args) => (_ctx.generatePasswordPreview && _ctx.generatePasswordPreview(...args))),
              class: "w-full mb-4 accent-[#315bd7]"
            }, null, 544 /* HYDRATE_EVENTS, NEED_PATCH */), [
              [
                _vModelText,
                _ctx.genLength,
                void 0,
                { number: true }
              ]
            ]),
            _createElementVNode("div", _hoisted_489, [
              _createElementVNode("button", {
                onClick: _cache[145] || (_cache[145] = (...args) => (_ctx.generatePasswordPreview && _ctx.generatePasswordPreview(...args))),
                class: "flex-1 h-9 rounded-lg border text-xs font-semibold"
              }, [
                _hoisted_490,
                _createTextVNode(_toDisplayString(_ctx.t('gen.refresh')), 1 /* TEXT */)
              ]),
              _createElementVNode("button", {
                onClick: _cache[146] || (_cache[146] = $event => {_ctx.copyText(_ctx.generatedPasswordString, true); _ctx.showGenModal = false}),
                class: "flex-1 h-9 rounded-lg bg-[#315bd7] text-xs font-semibold text-white"
              }, _toDisplayString(_ctx.t('common.copy')), 1 /* TEXT */)
            ])
          ], 2 /* CLASS */)
        ], 32 /* HYDRATE_EVENTS */))
      : _createCommentVNode("v-if", true),
    (_ctx.showExtensionModal)
      ? (_openBlock(), _createElementBlock("div", {
          key: 5,
          class: "fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4",
          onMousedown: _cache[151] || (_cache[151] = _withModifiers($event => (_ctx.showExtensionModal = false), ["self"]))
        }, [
          _createElementVNode("div", {
            class: _normalizeClass(['w-full max-w-lg max-h-[88dvh] overflow-y-auto rounded-2xl border p-6 space-y-3', _ctx.theme === 'dark' ? 'border-[#3c4e73] bg-[#202d49]' : 'border-[#dce3f4] bg-[#fffefa]'])
          }, [
            _createElementVNode("div", _hoisted_491, [
              _createElementVNode("h3", _hoisted_492, _toDisplayString(_ctx.t('extension.title')), 1 /* TEXT */),
              _createElementVNode("button", {
                onClick: _cache[148] || (_cache[148] = $event => (_ctx.showExtensionModal = false)),
                "aria-label": _ctx.t('common.close'),
                class: "opacity-70 hover:opacity-100"
              }, _hoisted_495, 8 /* PROPS */, _hoisted_493)
            ]),
            _createElementVNode("p", _hoisted_496, _toDisplayString(_ctx.t('extension.intro', { origin: _ctx.currentOrigin })), 1 /* TEXT */),
            _createElementVNode("ol", _hoisted_497, [
              _createElementVNode("li", _hoisted_498, [
                _hoisted_499,
                _createElementVNode("div", _hoisted_500, [
                  _createElementVNode("span", {
                    innerHTML: _ctx.t('extension.step1Html')
                  }, null, 8 /* PROPS */, _hoisted_501),
                  _createElementVNode("button", {
                    onClick: _cache[149] || (_cache[149] = (...args) => (_ctx.downloadBrowserExtensionZip && _ctx.downloadBrowserExtensionZip(...args))),
                    class: "mt-1.5 block h-9 w-full rounded-lg bg-[#315bd7] text-xs font-semibold text-white"
                  }, _toDisplayString(_ctx.t('extension.download')), 1 /* TEXT */)
                ])
              ]),
              _createElementVNode("li", _hoisted_502, [
                _hoisted_503,
                _createElementVNode("div", _hoisted_504, [
                  _createTextVNode(_toDisplayString(_ctx.t('extension.step2')) + " ", 1 /* TEXT */),
                  _createElementVNode("div", _hoisted_505, [
                    _createElementVNode("code", {
                      class: _normalizeClass(["flex-1 truncate rounded-lg border px-2.5 py-2 font-mono text-[11px] select-text", _ctx.theme === 'dark' ? 'border-[#3b4d70] bg-[#18243d]' : 'border-[#d8e0f3] bg-[#f8faff]'])
                    }, "chrome://extensions/", 2 /* CLASS */),
                    _createElementVNode("button", {
                      onClick: _cache[150] || (_cache[150] = $event => (_ctx.copyText('chrome://extensions/', false))),
                      class: "h-9 shrink-0 rounded-lg border border-[#315bd7]/40 px-3 text-[11px] font-semibold text-[#315bd7] dark:text-[#91d2ff]"
                    }, [
                      _hoisted_506,
                      _createTextVNode(" " + _toDisplayString(_ctx.t('common.copy')), 1 /* TEXT */)
                    ])
                  ]),
                  _createElementVNode("div", _hoisted_507, _toDisplayString(_ctx.t('extension.otherBrowsers')), 1 /* TEXT */)
                ])
              ]),
              _createElementVNode("li", _hoisted_508, [
                _hoisted_509,
                _createElementVNode("div", {
                  class: "min-w-0 flex-1",
                  innerHTML: _ctx.t('extension.step3Html')
                }, null, 8 /* PROPS */, _hoisted_510)
              ]),
              _createElementVNode("li", _hoisted_511, [
                _hoisted_512,
                _createElementVNode("div", {
                  class: "min-w-0 flex-1",
                  innerHTML: _ctx.t('extension.step4Html')
                }, null, 8 /* PROPS */, _hoisted_513)
              ]),
              _createElementVNode("li", _hoisted_514, [
                _hoisted_515,
                _createElementVNode("div", {
                  class: "min-w-0 flex-1",
                  innerHTML: _ctx.t('extension.step5Html')
                }, null, 8 /* PROPS */, _hoisted_516)
              ])
            ]),
            _createElementVNode("p", _hoisted_517, _toDisplayString(_ctx.t('extension.note')), 1 /* TEXT */)
          ], 2 /* CLASS */)
        ], 32 /* HYDRATE_EVENTS */))
      : _createCommentVNode("v-if", true),
    (_ctx.discountFullscreen && _ctx.discountCode && _ctx.discountCode.svg)
      ? (_openBlock(), _createElementBlock("div", _hoisted_518, [
          _createElementVNode("div", _hoisted_519, _toDisplayString(_ctx.decodePunycodeText(_ctx.selectedItem.decrypted.title)), 1 /* TEXT */),
          _createElementVNode("div", {
            innerHTML: _ctx.discountCode.svg,
            class: _normalizeClass(['w-full', _ctx.discountCode.format === 'qr' ? 'max-w-[min(80vw,70vh)]' : 'max-w-[900px]'])
          }, null, 10 /* CLASS, PROPS */, _hoisted_520),
          _createElementVNode("div", _hoisted_521, _toDisplayString(_ctx.discountCode.value), 1 /* TEXT */),
          _createElementVNode("button", {
            onClick: _cache[152] || (_cache[152] = (...args) => (_ctx.closeDiscountFullscreen && _ctx.closeDiscountFullscreen(...args))),
            class: "mt-2 h-10 rounded-lg border border-[#d8e0f3] px-5 text-[13px] font-semibold text-[#263756]"
          }, [
            _hoisted_522,
            _createTextVNode(" " + _toDisplayString(_ctx.t('common.close')), 1 /* TEXT */)
          ])
        ], 512 /* NEED_PATCH */))
      : _createCommentVNode("v-if", true),
    (_ctx.showPwaModal)
      ? (_openBlock(), _createElementBlock("div", {
          key: 7,
          class: "fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4",
          onMousedown: _cache[155] || (_cache[155] = _withModifiers($event => (_ctx.showPwaModal = false), ["self"]))
        }, [
          _createElementVNode("div", {
            class: _normalizeClass(['w-full max-w-lg max-h-[88dvh] overflow-y-auto rounded-2xl border p-6 space-y-3', _ctx.theme === 'dark' ? 'border-[#3c4e73] bg-[#202d49]' : 'border-[#dce3f4] bg-[#fffefa]'])
          }, [
            _createElementVNode("div", _hoisted_523, [
              _createElementVNode("h3", _hoisted_524, _toDisplayString(_ctx.t('pwa.title')), 1 /* TEXT */),
              _createElementVNode("button", {
                onClick: _cache[153] || (_cache[153] = $event => (_ctx.showPwaModal = false)),
                "aria-label": _ctx.t('common.close'),
                class: "opacity-70 hover:opacity-100"
              }, _hoisted_527, 8 /* PROPS */, _hoisted_525)
            ]),
            _createElementVNode("p", _hoisted_528, _toDisplayString(_ctx.t('pwa.intro')), 1 /* TEXT */),
            (_ctx.canInstallPwa)
              ? (_openBlock(), _createElementBlock("button", {
                  key: 0,
                  onClick: _cache[154] || (_cache[154] = (...args) => (_ctx.installPwaNow && _ctx.installPwaNow(...args))),
                  class: "h-10 w-full rounded-lg bg-[#315bd7] text-xs font-semibold text-white"
                }, [
                  _hoisted_529,
                  _createTextVNode(" " + _toDisplayString(_ctx.t('pwa.installNow')), 1 /* TEXT */)
                ]))
              : _createCommentVNode("v-if", true),
            _createElementVNode("div", {
              class: _normalizeClass(['rounded-xl border p-3.5', _ctx.theme === 'dark' ? 'border-[#3a4b70] bg-[#18243d]' : 'border-[#dfe5f3] bg-[#f8faff]'])
            }, [
              _createElementVNode("div", _hoisted_530, [
                _hoisted_531,
                _createTextVNode(" " + _toDisplayString(_ctx.t('pwa.ios.title')), 1 /* TEXT */)
              ]),
              _createElementVNode("ol", _hoisted_532, [
                _createElementVNode("li", {
                  innerHTML: _ctx.t('pwa.ios.step1Html')
                }, null, 8 /* PROPS */, _hoisted_533),
                _createElementVNode("li", null, _toDisplayString(_ctx.t('pwa.ios.step2')), 1 /* TEXT */),
                _createElementVNode("li", {
                  innerHTML: _ctx.t('pwa.ios.step3Html')
                }, null, 8 /* PROPS */, _hoisted_534)
              ])
            ], 2 /* CLASS */),
            _createElementVNode("div", {
              class: _normalizeClass(['rounded-xl border p-3.5', _ctx.theme === 'dark' ? 'border-[#3a4b70] bg-[#18243d]' : 'border-[#dfe5f3] bg-[#f8faff]'])
            }, [
              _hoisted_535,
              _createElementVNode("ol", _hoisted_536, [
                _createElementVNode("li", {
                  innerHTML: _ctx.t('pwa.android.step1Html')
                }, null, 8 /* PROPS */, _hoisted_537),
                _createElementVNode("li", {
                  innerHTML: _ctx.t('pwa.android.step2Html')
                }, null, 8 /* PROPS */, _hoisted_538),
                _createElementVNode("li", null, _toDisplayString(_ctx.t('pwa.android.step3')), 1 /* TEXT */)
              ])
            ], 2 /* CLASS */),
            _createElementVNode("div", {
              class: _normalizeClass(['rounded-xl border p-3.5', _ctx.theme === 'dark' ? 'border-[#3a4b70] bg-[#18243d]' : 'border-[#dfe5f3] bg-[#f8faff]'])
            }, [
              _createElementVNode("div", _hoisted_539, [
                _hoisted_540,
                _createTextVNode(" " + _toDisplayString(_ctx.t('pwa.desktop.title')), 1 /* TEXT */)
              ]),
              _createElementVNode("ol", _hoisted_541, [
                _createElementVNode("li", null, _toDisplayString(_ctx.t('pwa.desktop.step1')), 1 /* TEXT */),
                _createElementVNode("li", {
                  innerHTML: _ctx.t('pwa.desktop.step2Html')
                }, null, 8 /* PROPS */, _hoisted_542)
              ])
            ], 2 /* CLASS */),
            _createElementVNode("p", _hoisted_543, [
              _createTextVNode(_toDisplayString(_ctx.t('pwa.httpsNote')) + " ", 1 /* TEXT */),
              _createElementVNode("span", _hoisted_544, _toDisplayString(_ctx.currentOrigin), 1 /* TEXT */)
            ])
          ], 2 /* CLASS */)
        ], 32 /* HYDRATE_EVENTS */))
      : _createCommentVNode("v-if", true),
    (_ctx.showImportModal)
      ? (_openBlock(), _createElementBlock("div", {
          key: 8,
          class: "fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4",
          onMousedown: _cache[166] || (_cache[166] = _withModifiers($event => (_ctx.showImportModal = false), ["self"]))
        }, [
          _createElementVNode("div", {
            class: _normalizeClass(['w-full max-w-md rounded-2xl border p-6 space-y-3', _ctx.theme === 'dark' ? 'border-[#3c4e73] bg-[#202d49]' : 'border-[#dce3f4] bg-[#fffefa]'])
          }, [
            _createElementVNode("div", _hoisted_545, [
              _createElementVNode("h3", _hoisted_546, _toDisplayString(_ctx.t('import.title')), 1 /* TEXT */),
              _createElementVNode("button", {
                onClick: _cache[156] || (_cache[156] = $event => (_ctx.showImportModal = false)),
                "aria-label": _ctx.t('common.close'),
                class: "opacity-70 hover:opacity-100"
              }, _hoisted_549, 8 /* PROPS */, _hoisted_547)
            ]),
            _createElementVNode("div", _hoisted_550, [
              _createElementVNode("button", {
                onClick: _cache[157] || (_cache[157] = $event => (_ctx.importTab = 'csv')),
                class: _normalizeClass(['h-8 rounded-lg border text-xs font-semibold transition', _ctx.importTab === 'csv' ? 'border-[#315bd7] bg-[#315bd7] text-white' : 'border-[#d8e0f3] dark:border-[#3b4c6f]'])
              }, "CSV", 2 /* CLASS */),
              _createElementVNode("button", {
                onClick: _cache[158] || (_cache[158] = $event => (_ctx.importTab = 'json')),
                class: _normalizeClass(['h-8 rounded-lg border text-xs font-semibold transition', _ctx.importTab === 'json' ? 'border-[#315bd7] bg-[#315bd7] text-white' : 'border-[#d8e0f3] dark:border-[#3b4c6f]'])
              }, "JSON", 2 /* CLASS */)
            ]),
            (_ctx.importTab === 'json')
              ? (_openBlock(), _createElementBlock("div", _hoisted_551, [
                  _createElementVNode("p", _hoisted_552, _toDisplayString(_ctx.t('import.json.intro')), 1 /* TEXT */),
                  _createElementVNode("input", {
                    type: "file",
                    accept: ".json,application/json",
                    onChange: _cache[159] || (_cache[159] = (...args) => (_ctx.handleJsonFileSelect && _ctx.handleJsonFileSelect(...args))),
                    class: "text-xs w-full"
                  }, null, 32 /* HYDRATE_EVENTS */),
                  (_ctx.jsonError)
                    ? (_openBlock(), _createElementBlock("div", _hoisted_553, _toDisplayString(_ctx.jsonError), 1 /* TEXT */))
                    : _createCommentVNode("v-if", true),
                  (_ctx.jsonPreview)
                    ? (_openBlock(), _createElementBlock("div", _hoisted_554, [
                        _createElementVNode("div", _hoisted_555, [
                          _createTextVNode(_toDisplayString(_ctx.t('import.preview.total', { n: _ctx.jsonPreview.stats.total })), 1 /* TEXT */),
                          (_ctx.jsonPreview.skipped)
                            ? (_openBlock(), _createElementBlock("span", _hoisted_556, " (" + _toDisplayString(_ctx.t('import.preview.skipped', { n: _ctx.jsonPreview.skipped })) + ")", 1 /* TEXT */))
                            : _createCommentVNode("v-if", true)
                        ]),
                        _createElementVNode("div", null, _toDisplayString(_ctx.t('import.preview.scopes', { personal: _ctx.jsonPreview.stats.personal, family: _ctx.jsonPreview.stats.family })), 1 /* TEXT */),
                        _createElementVNode("div", null, _toDisplayString(_ctx.t('import.preview.types', { login: _ctx.jsonPreview.stats.login, card: _ctx.jsonPreview.stats.card, discount: _ctx.jsonPreview.stats.discount, wifi: _ctx.jsonPreview.stats.wifi, note: _ctx.jsonPreview.stats.note })), 1 /* TEXT */),
                        _createElementVNode("div", null, [
                          _createTextVNode(_toDisplayString(_ctx.t('import.preview.multi', { n: _ctx.jsonPreview.stats.multi })), 1 /* TEXT */),
                          (_ctx.jsonPreview.customFolders.length)
                            ? (_openBlock(), _createElementBlock("span", _hoisted_557, " · " + _toDisplayString(_ctx.t('import.preview.folders', { n: _ctx.jsonPreview.customFolders.length })), 1 /* TEXT */))
                            : _createCommentVNode("v-if", true)
                        ])
                      ]))
                    : _createCommentVNode("v-if", true),
                  (_ctx.jsonFamilyMissing)
                    ? (_openBlock(), _createElementBlock("label", _hoisted_558, [
                        _withDirectives(_createElementVNode("input", {
                          type: "checkbox",
                          "onUpdate:modelValue": _cache[160] || (_cache[160] = $event => ((_ctx.jsonForcePersonal) = $event)),
                          class: "mt-0.5 h-4 w-4"
                        }, null, 512 /* NEED_PATCH */), [
                          [_vModelCheckbox, _ctx.jsonForcePersonal]
                        ]),
                        _createElementVNode("span", null, _toDisplayString(_ctx.tp('import.json.noFamilyKey', _ctx.jsonPreview.stats.family)), 1 /* TEXT */)
                      ]))
                    : _createCommentVNode("v-if", true),
                  (_ctx.jsonResult)
                    ? (_openBlock(), _createElementBlock("div", _hoisted_559, _toDisplayString(_ctx.jsonResult), 1 /* TEXT */))
                    : _createCommentVNode("v-if", true),
                  _createElementVNode("p", _hoisted_560, _toDisplayString(_ctx.t('import.json.warning')), 1 /* TEXT */),
                  _createElementVNode("button", {
                    disabled: !_ctx.jsonPreview || !_ctx.jsonPreview.items.length || _ctx.jsonBusy || (_ctx.jsonFamilyMissing && !_ctx.jsonForcePersonal),
                    onClick: _cache[161] || (_cache[161] = (...args) => (_ctx.executeJsonImport && _ctx.executeJsonImport(...args))),
                    class: "w-full h-9 rounded-lg bg-[#315bd7] text-xs font-semibold text-white disabled:opacity-40"
                  }, _toDisplayString(_ctx.jsonBusy ? _ctx.t('import.busy') : _ctx.t('import.run')), 9 /* TEXT, PROPS */, _hoisted_561)
                ]))
              : _createCommentVNode("v-if", true),
            (_ctx.importTab === 'csv')
              ? (_openBlock(), _createElementBlock("div", _hoisted_562, [
                  _createElementVNode("p", _hoisted_563, _toDisplayString(_ctx.t('import.csv.intro')), 1 /* TEXT */),
                  _createElementVNode("input", {
                    type: "file",
                    accept: ".csv",
                    onChange: _cache[162] || (_cache[162] = (...args) => (_ctx.handleCsvFileSelect && _ctx.handleCsvFileSelect(...args))),
                    class: "text-xs w-full"
                  }, null, 32 /* HYDRATE_EVENTS */),
                  _createElementVNode("div", null, [
                    _createElementVNode("div", _hoisted_564, _toDisplayString(_ctx.t('import.csv.target')), 1 /* TEXT */),
                    _createElementVNode("div", _hoisted_565, [
                      _createElementVNode("button", {
                        onClick: _cache[163] || (_cache[163] = $event => (_ctx.importTargetScope = 'personal')),
                        class: _normalizeClass(['h-9 rounded-lg border text-xs font-semibold transition', _ctx.importTargetScope === 'personal' ? 'border-[#315bd7] bg-[#315bd7] text-white' : 'border-[#d8e0f3] dark:border-[#3b4c6f]'])
                      }, [
                        _hoisted_566,
                        _createTextVNode(" " + _toDisplayString(_ctx.t('nav.personal')), 1 /* TEXT */)
                      ], 2 /* CLASS */),
                      _createElementVNode("button", {
                        onClick: _cache[164] || (_cache[164] = $event => (_ctx.importTargetScope = 'family')),
                        class: _normalizeClass(['h-9 rounded-lg border text-xs font-semibold transition', _ctx.importTargetScope === 'family' ? 'border-[#315bd7] bg-[#315bd7] text-white' : 'border-[#d8e0f3] dark:border-[#3b4c6f]'])
                      }, [
                        _hoisted_567,
                        _createTextVNode(" " + _toDisplayString(_ctx.t('nav.family')), 1 /* TEXT */)
                      ], 2 /* CLASS */)
                    ])
                  ]),
                  (_ctx.parsedCsvItems.length)
                    ? (_openBlock(), _createElementBlock("div", _hoisted_568, _toDisplayString(_ctx.t('import.csv.found', { n: _ctx.parsedCsvItems.length })), 1 /* TEXT */))
                    : _createCommentVNode("v-if", true),
                  _createElementVNode("p", _hoisted_569, _toDisplayString(_ctx.t('import.csv.warning')), 1 /* TEXT */),
                  _createElementVNode("button", {
                    disabled: !_ctx.parsedCsvItems.length,
                    onClick: _cache[165] || (_cache[165] = (...args) => (_ctx.executeCsvImport && _ctx.executeCsvImport(...args))),
                    class: "w-full h-9 rounded-lg bg-[#315bd7] text-xs font-semibold text-white disabled:opacity-40"
                  }, _toDisplayString(_ctx.t('import.run')), 9 /* TEXT, PROPS */, _hoisted_570)
                ]))
              : _createCommentVNode("v-if", true)
          ], 2 /* CLASS */)
        ], 32 /* HYDRATE_EVENTS */))
      : _createCommentVNode("v-if", true),
    (_ctx.showSecurityModal)
      ? (_openBlock(), _createElementBlock("div", {
          key: 9,
          class: "fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4",
          onMousedown: _cache[172] || (_cache[172] = _withModifiers($event => (_ctx.showSecurityModal = false), ["self"]))
        }, [
          _createElementVNode("div", {
            class: _normalizeClass(['w-full max-w-md rounded-2xl border p-6 space-y-3 max-h-[90dvh] overflow-y-auto', _ctx.theme === 'dark' ? 'border-[#3c4e73] bg-[#202d49]' : 'border-[#dce3f4] bg-[#fffefa]'])
          }, [
            _createElementVNode("h3", _hoisted_571, _toDisplayString(_ctx.t('security.title')), 1 /* TEXT */),
            _withDirectives(_createElementVNode("input", {
              "onUpdate:modelValue": _cache[167] || (_cache[167] = $event => ((_ctx.pwdChangeForm.currentPassword) = $event)),
              type: "password",
              placeholder: _ctx.t('security.current'),
              class: "h-9 w-full rounded-lg border px-3 text-xs bg-transparent"
            }, null, 8 /* PROPS */, _hoisted_572), [
              [_vModelText, _ctx.pwdChangeForm.currentPassword]
            ]),
            _withDirectives(_createElementVNode("input", {
              "onUpdate:modelValue": _cache[168] || (_cache[168] = $event => ((_ctx.pwdChangeForm.newPassword) = $event)),
              type: "password",
              placeholder: _ctx.t('auth.newMasterPassword'),
              class: "h-9 w-full rounded-lg border px-3 text-xs bg-transparent"
            }, null, 8 /* PROPS */, _hoisted_573), [
              [_vModelText, _ctx.pwdChangeForm.newPassword]
            ]),
            _withDirectives(_createElementVNode("input", {
              "onUpdate:modelValue": _cache[169] || (_cache[169] = $event => ((_ctx.pwdChangeForm.confirmPassword) = $event)),
              type: "password",
              placeholder: _ctx.t('security.repeatNew'),
              class: "h-9 w-full rounded-lg border px-3 text-xs bg-transparent"
            }, null, 8 /* PROPS */, _hoisted_574), [
              [_vModelText, _ctx.pwdChangeForm.confirmPassword]
            ]),
            _createElementVNode("button", {
              onClick: _cache[170] || (_cache[170] = (...args) => (_ctx.handleChangeOwnPassword && _ctx.handleChangeOwnPassword(...args))),
              class: "w-full h-9 rounded-lg bg-[#315bd7] text-xs font-semibold text-white"
            }, _toDisplayString(_ctx.t('common.save')), 1 /* TEXT */),
            _createElementVNode("div", _hoisted_575, [
              _createElementVNode("label", _hoisted_576, [
                _createElementVNode("span", null, _toDisplayString(_ctx.t('security.siteIcons')), 1 /* TEXT */),
                _withDirectives(_createElementVNode("input", {
                  type: "checkbox",
                  "onUpdate:modelValue": _cache[171] || (_cache[171] = $event => ((_ctx.siteIconsEnabled) = $event)),
                  disabled: "",
                  class: "h-4 w-4"
                }, null, 512 /* NEED_PATCH */), [
                  [_vModelCheckbox, _ctx.siteIconsEnabled]
                ])
              ]),
              _createElementVNode("p", _hoisted_577, _toDisplayString(_ctx.t('security.siteIconsHint')), 1 /* TEXT */)
            ])
          ], 2 /* CLASS */)
        ], 32 /* HYDRATE_EVENTS */))
      : _createCommentVNode("v-if", true),
    (_ctx.showTotpModal)
      ? (_openBlock(), _createElementBlock("div", {
          key: 10,
          class: "fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4",
          onMousedown: _cache[189] || (_cache[189] = _withModifiers((...args) => (_ctx.closeTotpModal && _ctx.closeTotpModal(...args)), ["self"]))
        }, [
          _createElementVNode("div", {
            class: _normalizeClass(['w-full max-w-md rounded-2xl border p-6 space-y-3 max-h-[90dvh] overflow-y-auto', _ctx.theme === 'dark' ? 'border-[#3c4e73] bg-[#202d49]' : 'border-[#dce3f4] bg-[#fffefa]'])
          }, [
            _createElementVNode("div", _hoisted_578, [
              _createElementVNode("div", _hoisted_579, [
                _createElementVNode("h4", _hoisted_580, [
                  _hoisted_581,
                  _createTextVNode(" " + _toDisplayString(_ctx.t('totp.title')), 1 /* TEXT */)
                ]),
                (_ctx.totpStatus.loaded)
                  ? (_openBlock(), _createElementBlock("span", {
                      key: 0,
                      class: _normalizeClass(['rounded px-1.5 py-0.5 text-[10px] font-semibold', _ctx.totpStatus.enabled ? 'bg-[#329371]/15 text-[#329371]' : 'bg-black/5 dark:bg-white/10 opacity-70'])
                    }, _toDisplayString(_ctx.totpStatus.enabled ? _ctx.t('totp.status.on') : _ctx.t('totp.status.off')), 3 /* TEXT, CLASS */))
                  : _createCommentVNode("v-if", true)
              ]),
              _createElementVNode("p", _hoisted_582, _toDisplayString(_ctx.t('totp.hint')), 1 /* TEXT */),
              (_ctx.sessionToken === 'OFFLINE_MODE')
                ? (_openBlock(), _createElementBlock("p", _hoisted_583, _toDisplayString(_ctx.t('totp.offline')), 1 /* TEXT */))
                : (_ctx.totpBackupCodes.length)
                  ? (_openBlock(), _createElementBlock(_Fragment, { key: 1 }, [
                      _createElementVNode("p", _hoisted_584, _toDisplayString(_ctx.t('totp.backup.warning')), 1 /* TEXT */),
                      _createElementVNode("div", _hoisted_585, [
                        (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(_ctx.totpBackupCodes, (c) => {
                          return (_openBlock(), _createElementBlock("span", { key: c }, _toDisplayString(c), 1 /* TEXT */))
                        }), 128 /* KEYED_FRAGMENT */))
                      ]),
                      _createElementVNode("div", _hoisted_586, [
                        _createElementVNode("button", {
                          onClick: _cache[173] || (_cache[173] = (...args) => (_ctx.copyBackupCodes && _ctx.copyBackupCodes(...args))),
                          class: "flex-1 h-9 rounded-lg border text-xs font-semibold"
                        }, _toDisplayString(_ctx.t('common.copy')), 1 /* TEXT */),
                        _createElementVNode("button", {
                          onClick: _cache[174] || (_cache[174] = (...args) => (_ctx.downloadBackupCodes && _ctx.downloadBackupCodes(...args))),
                          class: "flex-1 h-9 rounded-lg bg-[#315bd7] text-xs font-semibold text-white"
                        }, _toDisplayString(_ctx.t('totp.backup.download')), 1 /* TEXT */)
                      ]),
                      _createElementVNode("button", {
                        onClick: _cache[175] || (_cache[175] = $event => (_ctx.totpBackupCodes = [])),
                        class: "w-full h-8 rounded-lg text-xs font-semibold opacity-75 hover:opacity-100"
                      }, _toDisplayString(_ctx.t('totp.backup.saved')), 1 /* TEXT */)
                    ], 64 /* STABLE_FRAGMENT */))
                  : (_ctx.totpSetup)
                    ? (_openBlock(), _createElementBlock(_Fragment, { key: 2 }, [
                        _createElementVNode("p", _hoisted_587, _toDisplayString(_ctx.t('totp.setup.scan')), 1 /* TEXT */),
                        _createElementVNode("div", _hoisted_588, [
                          _createElementVNode("div", {
                            class: "rounded-lg bg-white p-2",
                            innerHTML: _ctx.totpSetup.qr
                          }, null, 8 /* PROPS */, _hoisted_589)
                        ]),
                        _createElementVNode("p", _hoisted_590, _toDisplayString(_ctx.t('totp.setup.manual')), 1 /* TEXT */),
                        _createElementVNode("div", {
                          class: "cursor-pointer break-all rounded-lg border p-2 text-center font-mono text-[11px] select-text",
                          onClick: _cache[176] || (_cache[176] = $event => (_ctx.copyText(_ctx.totpSetup.secret, false)))
                        }, _toDisplayString(_ctx.totpSetup.secret), 1 /* TEXT */),
                        _withDirectives(_createElementVNode("input", {
                          "onUpdate:modelValue": _cache[177] || (_cache[177] = $event => ((_ctx.totpForm.code) = $event)),
                          inputmode: "numeric",
                          autocomplete: "one-time-code",
                          maxlength: "6",
                          placeholder: _ctx.t('totp.code'),
                          onKeyup: _cache[178] || (_cache[178] = _withKeys((...args) => (_ctx.confirmTotpEnable && _ctx.confirmTotpEnable(...args)), ["enter"])),
                          class: "h-9 w-full rounded-lg border px-3 font-mono text-xs tracking-widest bg-transparent"
                        }, null, 40 /* PROPS, HYDRATE_EVENTS */, _hoisted_591), [
                          [_vModelText, _ctx.totpForm.code]
                        ]),
                        _createElementVNode("div", _hoisted_592, [
                          _createElementVNode("button", {
                            onClick: _cache[179] || (_cache[179] = (...args) => (_ctx.cancelTotpSetup && _ctx.cancelTotpSetup(...args))),
                            class: "flex-1 h-9 rounded-lg border text-xs font-semibold"
                          }, _toDisplayString(_ctx.t('common.cancel')), 1 /* TEXT */),
                          _createElementVNode("button", {
                            onClick: _cache[180] || (_cache[180] = (...args) => (_ctx.confirmTotpEnable && _ctx.confirmTotpEnable(...args))),
                            class: "flex-1 h-9 rounded-lg bg-[#315bd7] text-xs font-semibold text-white"
                          }, _toDisplayString(_ctx.t('totp.setup.confirm')), 1 /* TEXT */)
                        ])
                      ], 64 /* STABLE_FRAGMENT */))
                    : (_ctx.totpStatus.enabled)
                      ? (_openBlock(), _createElementBlock(_Fragment, { key: 3 }, [
                          _createElementVNode("p", _hoisted_593, _toDisplayString(_ctx.tp('totp.backup.left', _ctx.totpStatus.backupCodesLeft)), 1 /* TEXT */),
                          _withDirectives(_createElementVNode("input", {
                            "onUpdate:modelValue": _cache[181] || (_cache[181] = $event => ((_ctx.totpForm.password) = $event)),
                            type: "password",
                            placeholder: _ctx.t('security.current'),
                            class: "h-9 w-full rounded-lg border px-3 text-xs bg-transparent"
                          }, null, 8 /* PROPS */, _hoisted_594), [
                            [_vModelText, _ctx.totpForm.password]
                          ]),
                          _withDirectives(_createElementVNode("input", {
                            "onUpdate:modelValue": _cache[182] || (_cache[182] = $event => ((_ctx.totpForm.code) = $event)),
                            autocomplete: "one-time-code",
                            placeholder: _ctx.t('totp.codeOrBackup'),
                            onKeyup: _cache[183] || (_cache[183] = _withKeys((...args) => (_ctx.disableTotp && _ctx.disableTotp(...args)), ["enter"])),
                            class: "h-9 w-full rounded-lg border px-3 font-mono text-xs bg-transparent"
                          }, null, 40 /* PROPS, HYDRATE_EVENTS */, _hoisted_595), [
                            [_vModelText, _ctx.totpForm.code]
                          ]),
                          _createElementVNode("button", {
                            onClick: _cache[184] || (_cache[184] = (...args) => (_ctx.disableTotp && _ctx.disableTotp(...args))),
                            class: "w-full h-9 rounded-lg border border-[#e11d48] text-xs font-semibold text-[#e11d48]"
                          }, _toDisplayString(_ctx.t('totp.disable')), 1 /* TEXT */)
                        ], 64 /* STABLE_FRAGMENT */))
                      : (_ctx.totpStatus.loaded)
                        ? (_openBlock(), _createElementBlock(_Fragment, { key: 4 }, [
                            _withDirectives(_createElementVNode("input", {
                              "onUpdate:modelValue": _cache[185] || (_cache[185] = $event => ((_ctx.totpForm.password) = $event)),
                              type: "password",
                              placeholder: _ctx.t('security.current'),
                              onKeyup: _cache[186] || (_cache[186] = _withKeys((...args) => (_ctx.startTotpSetup && _ctx.startTotpSetup(...args)), ["enter"])),
                              class: "h-9 w-full rounded-lg border px-3 text-xs bg-transparent"
                            }, null, 40 /* PROPS, HYDRATE_EVENTS */, _hoisted_596), [
                              [_vModelText, _ctx.totpForm.password]
                            ]),
                            _createElementVNode("button", {
                              onClick: _cache[187] || (_cache[187] = (...args) => (_ctx.startTotpSetup && _ctx.startTotpSetup(...args))),
                              class: "w-full h-9 rounded-lg bg-[#315bd7] text-xs font-semibold text-white"
                            }, _toDisplayString(_ctx.t('totp.enable')), 1 /* TEXT */)
                          ], 64 /* STABLE_FRAGMENT */))
                        : _createCommentVNode("v-if", true)
            ]),
            _createElementVNode("button", {
              onClick: _cache[188] || (_cache[188] = (...args) => (_ctx.closeTotpModal && _ctx.closeTotpModal(...args))),
              class: "w-full h-9 rounded-lg border text-xs font-semibold"
            }, _toDisplayString(_ctx.t('common.close')), 1 /* TEXT */)
          ], 2 /* CLASS */)
        ], 32 /* HYDRATE_EVENTS */))
      : _createCommentVNode("v-if", true),
    (_ctx.showRecoveryModal)
      ? (_openBlock(), _createElementBlock("div", {
          key: 11,
          class: "fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4",
          onMousedown: _cache[192] || (_cache[192] = _withModifiers($event => (_ctx.showRecoveryModal = false), ["self"]))
        }, [
          _createElementVNode("div", {
            class: _normalizeClass(['w-full max-w-md rounded-2xl border p-6 space-y-3', _ctx.theme === 'dark' ? 'border-[#3c4e73] bg-[#202d49]' : 'border-[#dce3f4] bg-[#fffefa]'])
          }, [
            _createElementVNode("h3", _hoisted_597, _toDisplayString(_ctx.t('auth.recoveryKey')), 1 /* TEXT */),
            _createElementVNode("div", _hoisted_598, _toDisplayString(_ctx.userRecoveryKeyPlain), 1 /* TEXT */),
            _createElementVNode("div", _hoisted_599, [
              _createElementVNode("button", {
                onClick: _cache[190] || (_cache[190] = $event => (_ctx.copyText(_ctx.userRecoveryKeyPlain, false))),
                class: "flex-1 h-9 rounded-lg border text-xs font-semibold"
              }, _toDisplayString(_ctx.t('common.copy')), 1 /* TEXT */),
              _createElementVNode("button", {
                onClick: _cache[191] || (_cache[191] = (...args) => (_ctx.downloadRecoverySheet && _ctx.downloadRecoverySheet(...args))),
                class: "flex-1 h-9 rounded-lg bg-[#315bd7] text-xs font-semibold text-white"
              }, _toDisplayString(_ctx.t('recovery.download')), 1 /* TEXT */)
            ])
          ], 2 /* CLASS */)
        ], 32 /* HYDRATE_EVENTS */))
      : _createCommentVNode("v-if", true),
    (_ctx.showAdminModal)
      ? (_openBlock(), _createElementBlock("div", {
          key: 12,
          class: "fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4",
          onMousedown: _cache[196] || (_cache[196] = _withModifiers($event => (_ctx.showAdminModal = false), ["self"]))
        }, [
          _createElementVNode("div", {
            class: _normalizeClass(['w-full max-w-md rounded-2xl border p-6 space-y-3 max-h-[85dvh] overflow-y-auto', _ctx.theme === 'dark' ? 'border-[#3c4e73] bg-[#202d49]' : 'border-[#dce3f4] bg-[#fffefa]'])
          }, [
            _createElementVNode("div", _hoisted_600, [
              _createElementVNode("h3", _hoisted_601, _toDisplayString(_ctx.t('admin.title')), 1 /* TEXT */),
              _createElementVNode("button", {
                onClick: _cache[193] || (_cache[193] = $event => (_ctx.showAdminModal = false)),
                "aria-label": _ctx.t('common.close')
              }, _hoisted_604, 8 /* PROPS */, _hoisted_602)
            ]),
            _createElementVNode("button", {
              onClick: _cache[194] || (_cache[194] = (...args) => (_ctx.createInviteCode && _ctx.createInviteCode(...args))),
              class: "w-full h-9 rounded-lg bg-[#315bd7] text-xs font-semibold text-white"
            }, _toDisplayString(_ctx.t('admin.createInvite')), 1 /* TEXT */),
            (_ctx.lastCreatedInvite)
              ? (_openBlock(), _createElementBlock("div", {
                  key: 0,
                  class: "p-3 rounded-lg border font-mono text-center text-base font-bold text-[#329371] cursor-pointer",
                  onClick: _cache[195] || (_cache[195] = $event => (_ctx.copyText(_ctx.lastCreatedInvite, false)))
                }, [
                  _createTextVNode(_toDisplayString(_ctx.lastCreatedInvite) + " ", 1 /* TEXT */),
                  _createElementVNode("span", _hoisted_605, _toDisplayString(_ctx.t('admin.inviteHint', { min: 60 })), 1 /* TEXT */)
                ]))
              : _createCommentVNode("v-if", true),
            _createElementVNode("div", _hoisted_606, [
              _createElementVNode("div", _hoisted_607, _toDisplayString(_ctx.t('admin.members', { n: _ctx.familyMembers.length })), 1 /* TEXT */),
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(_ctx.familyMembers, (m) => {
                return (_openBlock(), _createElementBlock("div", {
                  key: m.id,
                  class: "flex items-center justify-between gap-2 py-2 border-b last:border-b-0 border-black/10 dark:border-white/10 text-xs"
                }, [
                  _createElementVNode("div", _hoisted_608, [
                    _createElementVNode("b", null, _toDisplayString(m.username), 1 /* TEXT */),
                    _createElementVNode("span", _hoisted_609, "(" + _toDisplayString(m.is_admin ? _ctx.t('admin.roleAdmin') : _ctx.t('admin.roleMember')) + ")", 1 /* TEXT */),
                    (!m.is_admin)
                      ? (_openBlock(), _createElementBlock("div", _hoisted_610, _toDisplayString(m.can_admin_recover ? _ctx.t('admin.canReset') : _ctx.t('admin.cannotReset')), 1 /* TEXT */))
                      : _createCommentVNode("v-if", true)
                  ]),
                  (m.can_admin_recover && !m.is_admin)
                    ? (_openBlock(), _createElementBlock("button", {
                        key: 0,
                        onClick: $event => (_ctx.adminResetMemberPassword(m)),
                        class: "shrink-0 rounded-md bg-[#315bd7]/15 px-2.5 py-1 text-[10.5px] font-semibold text-[#315bd7] dark:text-[#91d2ff]"
                      }, _toDisplayString(_ctx.t('admin.resetPassword')), 9 /* TEXT, PROPS */, _hoisted_611))
                    : _createCommentVNode("v-if", true)
                ]))
              }), 128 /* KEYED_FRAGMENT */))
            ])
          ], 2 /* CLASS */)
        ], 32 /* HYDRATE_EVENTS */))
      : _createCommentVNode("v-if", true),
    (_ctx.showLogsModal)
      ? (_openBlock(), _createElementBlock("div", {
          key: 13,
          class: "fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4",
          onMousedown: _cache[199] || (_cache[199] = _withModifiers($event => (_ctx.showLogsModal = false), ["self"]))
        }, [
          _createElementVNode("div", {
            class: _normalizeClass(['w-full max-w-lg rounded-2xl border p-6 space-y-3 max-h-[85dvh] flex flex-col', _ctx.theme === 'dark' ? 'border-[#3c4e73] bg-[#202d49]' : 'border-[#dce3f4] bg-[#fffefa]'])
          }, [
            _createElementVNode("div", _hoisted_612, [
              _createElementVNode("h3", _hoisted_613, _toDisplayString(_ctx.t('logs.title')), 1 /* TEXT */),
              _createElementVNode("div", _hoisted_614, [
                _createElementVNode("button", {
                  onClick: _cache[197] || (_cache[197] = (...args) => (_ctx.clearSystemLogs && _ctx.clearSystemLogs(...args))),
                  class: "text-xs text-[#e11d48] font-semibold"
                }, _toDisplayString(_ctx.t('logs.clear')), 1 /* TEXT */),
                _createElementVNode("button", {
                  onClick: _cache[198] || (_cache[198] = $event => (_ctx.showLogsModal = false)),
                  "aria-label": _ctx.t('common.close')
                }, _hoisted_617, 8 /* PROPS */, _hoisted_615)
              ])
            ]),
            _createElementVNode("div", _hoisted_618, [
              (_ctx.systemLogs.length === 0)
                ? (_openBlock(), _createElementBlock("div", _hoisted_619, _toDisplayString(_ctx.t('logs.empty')), 1 /* TEXT */))
                : _createCommentVNode("v-if", true),
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(_ctx.systemLogs, (l) => {
                return (_openBlock(), _createElementBlock("div", {
                  key: l.id,
                  class: "p-2 rounded border border-black/5 dark:border-white/5 flex justify-between gap-2"
                }, [
                  _createElementVNode("span", null, [
                    _createElementVNode("b", null, "[" + _toDisplayString(l.ts) + "]", 1 /* TEXT */),
                    _createTextVNode(" " + _toDisplayString(_ctx.logText(l)), 1 /* TEXT */)
                  ]),
                  _createElementVNode("span", _hoisted_620, _toDisplayString(l.user), 1 /* TEXT */)
                ]))
              }), 128 /* KEYED_FRAGMENT */))
            ])
          ], 2 /* CLASS */)
        ], 32 /* HYDRATE_EVENTS */))
      : _createCommentVNode("v-if", true),
    _createElementVNode("div", _hoisted_621, [
      (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(_ctx.toasts, (toast) => {
        return (_openBlock(), _createElementBlock("div", {
          key: toast.id,
          role: toast.kind === 'error' ? 'alert' : 'status',
          class: _normalizeClass(['flex items-center gap-2 rounded-lg border px-4 py-2.5 text-[11px] font-medium shadow-lg',
                         toast.kind === 'error' ? (_ctx.theme === 'dark' ? 'border-[#8a4343] bg-[#3b2020] text-[#ffd6d6]' : 'border-[#f0b8b8] bg-[#fff2f2] text-[#8a2f2f]')
                         : toast.kind === 'warn' ? (_ctx.theme === 'dark' ? 'border-[#8a7443] bg-[#3b3320] text-[#fff0d0]' : 'border-[#f0dcb0] bg-[#fffaf0] text-[#8a6a1f]')
                         : (_ctx.theme === 'dark' ? 'border-[#3e7869] bg-[#203b3b] text-[#d6f4e5]' : 'border-[#b8e4d2] bg-[#f2fff8] text-[#2f7457]')])
        }, [
          _createElementVNode("i", {
            class: _normalizeClass(['fa-solid', toast.kind === 'error' ? 'fa-circle-xmark text-[#d14b4b]' : toast.kind === 'warn' ? 'fa-triangle-exclamation text-[#d19a2b]' : 'fa-check text-[#329371]'])
          }, null, 2 /* CLASS */),
          _createTextVNode(" " + _toDisplayString(toast.text), 1 /* TEXT */)
        ], 10 /* CLASS, PROPS */, _hoisted_622))
      }), 128 /* KEYED_FRAGMENT */))
    ])
  ], 2 /* CLASS */))
}
})();
