LOCAL_PATH:= $(call my-dir)

# any additional addons that want to use the node/v8 headers
# should add the prebuilt/include  to their LOCAL_C_INCLUDES

# prebuilt libv8 dummy first
# this works around a naming bug in the prebuilt.mk file
# which fails to make a correct export_includes dir
include $(CLEAR_VARS)
LOCAL_MODULE          := libv8
LOCAL_MODULE_CLASS    := SHARED_LIBRARIES
LOCAL_MODULE_TAGS     := eng
LOCAL_SRC_FILES       := prebuilt/binaries/libv8_empty
include $(BUILD_PREBUILT)

# prebuilt libv8 
include $(CLEAR_VARS)
LOCAL_MODULE          := libv8.so
LOCAL_MODULE_CLASS    := SHARED_LIBRARIES
LOCAL_MODULE_TAGS     := eng
LOCAL_SRC_FILES       := prebuilt/binaries/libv8.so
include $(BUILD_PREBUILT)

# prebuilt node next
include $(CLEAR_VARS)
LOCAL_MODULE          := node
LOCAL_MODULE_CLASS    := EXECUTABLES
LOCAL_MODULE_TAGS     := eng
LOCAL_SRC_FILES       := prebuilt/binaries/node
include $(BUILD_PREBUILT)


# now the main addon
include $(CLEAR_VARS)

LOCAL_SRC_FILES:= \
    src/sg/fonts/vector.c \
    src/sg/fonts/vertex-buffer.c \
    src/sg/fonts/vertex-attribute.c \
    src/sg/fonts/texture-atlas.c \
    src/sg/fonts/texture-font.c \
    src/sg/fonts/shader.c \
    src/sg/fonts/mat4.c \
    src/sg/image.cpp \
    src/sg/shaders.cpp \
    src/sg/base.cpp \
    src/sg/klaatu_events.cpp \
    src/sg/klaatu.cpp



LOCAL_MODULE:= libaminolang
LOCAL_MODULE_CLASS    := SHARED_LIBRARIES
LOCAL_MODULE_TAGS := eng
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
	external/freetype/include \
	frameworks/base/include/surfaceflinger \
	frameworks/native/opengl/include \
	$(LOCAL_PATH)/src/sg/fonts \
	$(LOCAL_PATH)/prebuilt/include

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


# and the fixup shell script
include $(CLEAR_VARS)

LOCAL_SRC_FILES:= \
	aminolang-dependencyForcer.c

LOCAL_SHARED_LIBRARIES := \
	libaminolang 

LOCAL_MODULE:= aminolang-dependencyForcer
LOCAL_MODULE_TAGS := eng
LOCAL_MODULE_CLASS := EXECUTABLES
intermediates:= $(local-intermediates-dir)
GEN := $(LOCAL_PATH)/aminolang-dependencyForcer.c
$(GEN): PRIVATE_INPUT_FILE := $(LOCAL_PATH)/AndroidFixup.sh
$(GEN): PRIVATE_CUSTOM_TOOL = bash $(PRIVATE_INPUT_FILE) $@ 
$(GEN): $(LOCAL_PATH)/AndroidFixup.sh 
	$(transform-generated-source)
$(GEN): libaminolang
.PHONY: $(GEN)
#LOCAL_GENERATED_SOURCES += $(GEN)



include $(BUILD_EXECUTABLE)
