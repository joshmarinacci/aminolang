LOCAL_PATH:= $(call my-dir)


include $(CLEAR_VARS)
LOCAL_SRC_FILES:= build/cpp/out.cpp src/cppgles/test1.cpp src/cppgles/impl.cpp tests/toddler.cpp
LOCAL_MODULE:= aminolang
LOCAL_MODULE_TAGS := optional
LOCAL_C_INCLUDES := frameworks/base/services \
	external/skia/include/core \
	bionic \
	external/stlport/stlport \
	external/libpng \
	external/zlib \
	frameworks/base/include/surfaceflinger
LOCAL_STATIC_LIBRARIES := libcutils libc libpng libz
LOCAL_SHARED_LIBRARIES := libEGL libGLESv2 libui libgui libutils libstlport libinput

include $(BUILD_EXECUTABLE)



