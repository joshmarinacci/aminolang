{
    "targets": [
        {
            "target_name":"aminonative",
            "sources":[
                "src/sg/fonts/vector.c",
                "src/sg/fonts/vertex-buffer.c",
                "src/sg/fonts/vertex-attribute.c",
                "src/sg/fonts/texture-atlas.c",
                "src/sg/fonts/texture-font.c",    
                "src/sg/fonts/shader.c",    
                "src/sg/fonts/mat4.c",
                
                "src/sg/base.cc",
                "src/sg/shaders.cpp",
                "src/sg/image.cpp"
            ],
            "include_dirs": [
                    "src/sg/",
                    "src/sg/fonts/",
                    "/usr/local/Cellar/freetype/2.4.11/include/freetype2",
                    "/usr/local/Cellar/freetype/2.4.11/include",
            ],
            
            'conditions': [
                ['OS=="mac"', {
                    "libraries": [
                        "-lglfw",
                        "-ljpeg",
                        "-lpng",
                        '-framework OpenGL',
                        '-framework OpenCL',
                        '<!@(freetype-config --libs)'
                    ],
                    "sources": [
                        "src/sg/mac.cpp",
                    ],
                    "defines": [
                        "MAC"
                    ]
                }],
                
                ['OS=="klaatu"', {
                    "defines": [
                        "KLAATU"
                    ]
                }],
                ['OS=="raspberrypi"', {
                    "sources": [
                        "src/sg/rpi.cpp",
                    ],
                    "libraries":[
                        "-lpng",
                        "-ljpeg",
                        "-L/opt/vc/lib/ -lbcm_host",
                        "-lGLESv2",
                        "-lEGL",
                        '<!@(freetype-config --libs)',
                    ],
                    "defines": [
                        "RPI"
                    ],
                    "include_dirs": [
                        "/opt/vc/include/",
                        "/usr/include/freetype2",
                        "/opt/vc/include/interface/vcos/pthreads",
                        "/opt/vc/include/interface/vmcs_host/linux",
                        '<!@(freetype-config --cflags)'
                    ],
                }],

                ['OS=="linux"', {
                    "libraries":[
                        "-lglfw",
                        "-lpng",
                        "-ljpeg",
                    ],
                    "defines": [
                        "GL_GLEXT_PROTOTYPES",
                        "LINUX"
                    ]
                }]
            ]

        }
    ]
}
