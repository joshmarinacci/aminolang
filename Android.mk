LOCAL_PATH:= $(call my-dir)

#define a static lib for v8
include $(CLEAR_VARS)
SHOW_COMMANDS         := show
LOCAL_MODULE_TAGS     := optional
LOCAL_MODULE          := libv8
LOCAL_MODULE_CLASS    := SHARED_LIBRARIES
LOCAL_SRC_FILES       := libssl.so
include $(BUILD_PREBUILT)



#reset to do the real build of our module
include $(CLEAR_VARS)
LOCAL_SRC_FILES:= \
    src/node/shaders.cpp \
    src/node/klaatu.cpp \
    src/node/klaatu_events.cpp \
    
LOCAL_MODULE:= aminolang
LOCAL_MODULE_TAGS := optional
LOCAL_C_INCLUDES := frameworks/base/services \
	external/skia/include/core \
	bionic \
	external/stlport/stlport \
	external/myapps/node/src \
	external/myapps/node/deps/uv/include \
	external/myapps/node/deps/v8/include \
	frameworks/base/include/surfaceflinger
LOCAL_STATIC_LIBRARIES := libcutils libc
# libpng libz

LOCAL_ALLOW_UNDEFINED_SYMBOLS := true
LOCAL_SHARED_LIBRARIES := libEGL libGLESv2 libui libgui libutils libstlport libinput libv8
#libmedia libcutils libbinder

#include $(BUILD_EXECUTABLE)
#building a shared lib because this is for a NodeJS addon
include $(BUILD_SHARED_LIBRARY)



