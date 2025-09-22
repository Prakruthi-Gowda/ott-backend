import fs from 'fs';

// Delete uploaded files if duplicate is found
export function deleteUploadedFiles(files) {
  if (!files) return;
  const fileFields = ['banner', 'trailer', 'movie'];
  for (const field of fileFields) {
    if (files[field] && Array.isArray(files[field])) {
      for (const file of files[field]) {
        if (file.path && fs.existsSync(file.path)) {
          try {
            fs.unlinkSync(file.path);
          } catch (err) {
            // Optionally log error
          }
        }
      }
    }
  }
}
