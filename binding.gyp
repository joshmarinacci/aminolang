{
    "targets": [
        {
            "target_name":"amino",
            "sources":["src/node/mac.cpp","src/node/shaders.cpp"],
            "include_dirs": [
                    "/Users/josh/projects/lib/glfw/include",
                    "src/node/",
            ],
            "library_dirs": [
                    "/Users/josh/projects/lib/glfw/lib/cocoa",
            ],
            'conditions': [
                ['OS=="mac"', {'libraries': ['-lglfw', '-framework OpenGL', '-framework OpenCL']}],
            ]

        }
    ]
}
