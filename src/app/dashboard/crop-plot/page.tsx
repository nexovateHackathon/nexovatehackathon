"use client";

import CropPlot3D from "@/components/crop-plot-3d";

export default function CropPlotPage() {
  return (
    <div className="flex-1 space-y-6">
      <div className="pt-5">
        <h1 className="text-3xl font-bold font-headline">3D Crop Plot</h1>
        <p className="text-muted-foreground">Visualize your farmland dimensions and crop layout in 3D.</p>
      </div>
      <CropPlot3D defaultLengthM={20} defaultWidthM={12} defaultCrop="Box" />
    </div>
  );
}



