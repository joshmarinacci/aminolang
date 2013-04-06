{
    "targets": [
        {
            "target_name":"aminonode",
            "sources":["build/cpp/out.cpp","src/cppgles/impl.cpp","src/cppgles/nodeimpl.cpp"],
            "include_dirs": [
                    "/Users/josh/projects/lib/glfw/include",
                    "build/cpp/",
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
