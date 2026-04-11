export type IMediaType = 'IMAGE' | 'VIDEO' | 'AUDIO'

// Local file selection state (before upload)
export interface IUploadedMedia {
  file?: File
}

// What the upload endpoint returns after uploading to Cloudinary
export interface ICloudinaryUploadResult {
  url: string
  public_id: string
  type: IMediaType
}
