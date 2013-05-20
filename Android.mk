LOCAL_PATH:= $(call my-dir)

#define a prebuilt shared lib for v8
include $(CLEAR_VARS)
LOCAL_MODULE          := libv8.so
LOCAL_MODULE_CLASS    := SHARED_LIBRARIES
#LOCAL_MODULE_PATH     := $(TARGET_OUT)/foo
LOCAL_MODULE_TAGS     := optional
#LOCAL_SHARED_LIBRARIES := libssl.so libcrypto.so
LOCAL_SRC_FILES       := prebuilt/libv8.so
include $(BUILD_PREBUILT)



#reset to do the real build of our module
include $(CLEAR_VARS)
LOCAL_SRC_FILES:= \
    src/node/shaders.cpp \
    src/node/klaatu.cpp \
    src/node/klaatu_events.cpp \
    src/node/image.cpp \
    
LOCAL_MODULE:= aminolang
LOCAL_MODULE_TAGS := optional
LOCAL_C_INCLUDES := frameworks/base/services \
	external/skia/include/core \
	bionic \
	external/stlport/stlport \
	external/node/src \
	external/node/deps/uv/include \
	external/node/deps/v8/include \
	external/jpeg \
	external/libpng \
	external/zlib \
	frameworks/base/include/surfaceflinger
LOCAL_STATIC_LIBRARIES := libcutils libc
# libpng libz

LOCAL_CFLAGS = -DKLAATU
LOCAL_ALLOW_UNDEFINED_SYMBOLS := true
LOCAL_STATIC_LIBRARIES := libcutils libc libpng libz
TARGET_CUSTOM_DEBUG_CFLAGS := ­O0 -g
LOCAL_SHARED_LIBRARIES := \
    libEGL libGLESv2 libui libgui \
    libutils libstlport libinput \
    libv8 \
    libjpeg \
    libmedia libbinder libcutils

#include $(BUILD_EXECUTABLE)
#building a shared lib because this is for a NodeJS addon
include $(BUILD_SHARED_LIBRARY)



