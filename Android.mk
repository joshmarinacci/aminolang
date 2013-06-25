LOCAL_PATH:= $(call my-dir)


include $(CLEAR_VARS)

LOCAL_SRC_FILES:= \
    src/node/klaatu.cpp \
    src/node/shaders.cpp \
    src/node/klaatu_events.cpp \
    src/node/image.cpp 



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

LOCAL_CFLAGS = -DKLAATU -DBUILDING_NODE_EXTENSION
LOCAL_ALLOW_UNDEFINED_SYMBOLS := true
LOCAL_STATIC_LIBRARIES := libpng
TARGET_CUSTOM_DEBUG_CFLAGS := ­O0 -g
LOCAL_SHARED_LIBRARIES := \
    libEGL libGLESv2 libui libgui \
    libutils libstlport libinput \
    libjpeg \
    libv8 \
    libmedia libbinder libcutils \
    libz


#building a shared lib because this is for a NodeJS addon
include $(BUILD_SHARED_LIBRARY)



