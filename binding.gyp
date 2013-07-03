{
    "targets": [
        {
            "target_name":"aminonative",
            "sources":[
                "src/sg/base.cc",
                "src/sg/mac.cpp",
                "src/sg/shaders.cpp",
                "src/sg/image.cpp"
            ],
            "include_dirs": [
                    "src/sg/",
            ],
            
            'conditions': [
                ['OS=="mac"', {
                    "libraries": [
                        "-lglfw",
                        "-ljpeg",
                        "-lpng",
                        '-framework OpenGL',
                        '-framework OpenCL'
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
