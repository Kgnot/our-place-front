import exifr from 'exifr';

export interface ImageExif {
  takenAt: string | null; // ISO 8601
  latitude: number | null;
  longitude: number | null;
  mimeType: string;
  fileSizeBytes: number;
}

export async function extractExif(file: File): Promise<ImageExif> {
  try {
    const data = await exifr.parse(file, {
      tiff: true,
      exif: true,
      gps: true,
      pick: ['DateTimeOriginal', 'latitude', 'longitude'],
    });
    console.log("data: ", data);

    return {
      takenAt: data?.DateTimeOriginal?.toISOString() ?? null,
      latitude: data?.latitude ?? null,
      longitude: data?.longitude ?? null,
      mimeType: file.type,
      fileSizeBytes: file.size,
    };
  } catch {
    // No tiene EXIF o no es una imagen — defaults
    return {
      takenAt: null,
      latitude: null,
      longitude: null,
      mimeType: file.type,
      fileSizeBytes: file.size,
    };
  }
}
