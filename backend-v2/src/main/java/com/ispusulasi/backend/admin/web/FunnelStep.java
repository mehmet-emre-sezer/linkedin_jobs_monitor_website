package com.ispusulasi.backend.admin.web;

/** Donusum hunisinin bir adimi: etiket + o adimdaki kullanici sayisi. */
public record FunnelStep(String label, long userCount) {}
