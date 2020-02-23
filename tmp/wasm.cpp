#include <stdint.h>
#include <stdio.h>
#include <string.h>
#include <math.h>
#include <vector>

#if defined(__EMSCRIPTEN__)
  /* compiler-args
  -s USE_GLFW=3
  -s USE_WEBGL2=1
  -s WASM=1
  -I E:/reps/denis-belov/xgk/src
  */
  #include <emscripten.h>
  // #include <wasm_simd128.h>
  #include <GLES3/gl3.h>
  #include <GLFW/glfw3.h>
#elif defined(__GNUC__) || defined(__MINGW64__) || defined(__clang__) || defined(_MSC_VER)
  // #include <intrin.h>
  #include "glad/glad.h"
  #include "glfw3.h"
#endif

#include "xgk-base.h"
// #define XGK_MACRO_DATA_WRAPPERS_SSE
#include "data/base.h"
#include "data/vec4.h"
#include "data/mat4.h"
#include "xgk-uniform-storage.h"



static void error_callback(int error, const char* description) {
  fprintf(stderr, "Error: %s\n", description);
};



static const float vertices[9] = { -1.0f, -1.0f, 0.0f,  0.0f, 1.0f, 0.0f,  1.0f, 1.0f, 0.0f };



static const char*  vertex_shader_code = "#version 300 es\n"
"  // #version 440\n"
"  #extension GL_ARB_separate_shader_objects : enable\n"
"  precision highp float;\n"
"\n"
"  layout (location = 0) in vec3 vertex_data;\n"
"\n"
"  // out gl_PerVertex {\n"
"  //   vec4 gl_Position;\n"
"  // };\n"
"\n"
"  out vec4 position;\n"
"\n"
"  void main (void) {\n"
"    gl_Position = vec4(vertex_data, 1.0);\n"
"  }\n";

static const char* fragment_shader_code = "#version 300 es\n"
"  // #version 440\n"
"  #extension GL_ARB_separate_shader_objects : enable\n"
"  precision highp float;\n"
"\n"
"  uniform vec4 b;\n"
"\n"
"  layout (location = 0) out vec4 outputColor;\n"
"\n"
"  void main (void) {\n"
"    outputColor = b;\n"
"  }\n";



#define ITERATION \
  glClear(GL_COLOR_BUFFER_BIT);\
  glUseProgram(program);\
  glDrawArrays(GL_TRIANGLES, 0, 3);

#ifdef __EMSCRIPTEN__
  GLuint program = 0;

  void one_iter (void) {
    ITERATION
  };

  // void EMSCRIPTEN_KEEPALIVE qqq (void) {

  // }
#endif



#ifdef __EMSCRIPTEN__
  int EMSCRIPTEN_KEEPALIVE main (void) {
#else
  int main (void) {
#endif
  // initializing
  if (!glfwInit()) {
    return 1;
  }

  GLFWwindow* window = glfwCreateWindow(640, 480, "Simple example", nullptr, nullptr);

  if (!window) {
    glfwTerminate();

    return 1;
  }

  glfwMakeContextCurrent(window);

  glfwSetErrorCallback(error_callback);

  #ifndef __EMSCRIPTEN__
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 2);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 0);

    // glfwSetKeyCallback(window, key_callback);
    gladLoadGL();
    glfwSwapInterval(1);
  #endif
  //



  glViewport(0, 0, 640, 480);
  glClearColor(1.0f, 0.0f, 0.0f, 1.0f);



  GLuint vertex_buffer;
  glGenBuffers(1, &vertex_buffer);
  glBindBuffer(GL_ARRAY_BUFFER, vertex_buffer);
  glBufferData(GL_ARRAY_BUFFER, 4 * 9, vertices, GL_STATIC_DRAW);



  GLuint vertex_shader = glCreateShader(GL_VERTEX_SHADER);
  glShaderSource(vertex_shader, 1, &vertex_shader_code, nullptr);
  glCompileShader(vertex_shader);



  GLuint fragment_shader = glCreateShader(GL_FRAGMENT_SHADER);
  glShaderSource(fragment_shader, 1, &fragment_shader_code, nullptr);
  glCompileShader(fragment_shader);



  #ifdef __EMSCRIPTEN__
    program = glCreateProgram();
  #else
    GLuint program = glCreateProgram();
  #endif
  glAttachShader(program, vertex_shader);
  glAttachShader(program, fragment_shader);
  glLinkProgram(program);
  // printf("%s\n", glGetString(GL_VERSION));
  // printf("%s\n", glGetString(GL_SHADING_LANGUAGE_VERSION));



  glUseProgram(program);
  XGK::Vec4Wrapper v;
  XGK::VEC4::set32(&v.data, 0.0f, 0.0f, 0.0f, 1.0f);
  printf("%i\n", glGetUniformLocation(program, "b"));
  // char* uniform_type = "vec3";
  // printf("%i\n", strcmp(uniform_type, "vec4") + 1);
  // glUniform4f(glGetUniformLocation(program, "b"), v.data.f32[0], v.data.f32[1], v.data.f32[2], v.data.f32[3]);
  XGK::UniformStorage s;
  XGK::UNIFORM_STORAGE::injectUniform(
    &s,
    &v,
    "opengl_program",
    "vec4",
    glGetUniformLocation(program, "b"),
    0,
    0
  );



  glEnableVertexAttribArray(0);
  glVertexAttribPointer(0, 3, GL_FLOAT, 0, 0, 0);



  #ifdef __EMSCRIPTEN__
    emscripten_set_main_loop(one_iter, 60, 1);
  #else
    while (1) {
      // int width, height;
      // glfwGetFramebufferSize(window, &width, &height);
      ITERATION

      glfwSwapBuffers(window);
    }
  #endif



  // destroying
  glfwDestroyWindow(window);
  glfwTerminate();
  //


  
  return 0;
};

#undef ITERATION
