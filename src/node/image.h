typedef struct ImageStruct {
    char* data;
    int w;
    int h;
} Image;

typedef Image image_struct;

Image * pngfile_to_bytes(char* file_name);
Image * jpegfile_to_bytes(char* file_name);


