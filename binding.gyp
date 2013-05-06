{
    "targets": [
        {
            "target_name":"amino",
            "sources":["src/node/mac.cpp","src/node/shaders.cpp","src/node/image.cpp"],
            "include_dirs": [
                    "src/node/",
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
                }]
            ]

        }
    ]
}
