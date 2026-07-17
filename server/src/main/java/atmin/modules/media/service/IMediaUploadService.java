package atmin.modules.media.service;

import org.springframework.web.multipart.MultipartFile;

public interface IMediaUploadService {
    String uploadFile(MultipartFile file);
}