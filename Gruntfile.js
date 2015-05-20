module.exports = function(grunt) {

    grunt.initConfig({
        jshint: {
            files: ['Gruntfile.js', 'jsdoc.json', 'src/**/*.js']
        },
        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint', 'uglify:js_minify', 'jsdoc', 'jsdoc2md']
        },
        uglify: {
            js_minify: {
                files: {
                    'bin/pulse.min.js': ['src/**/*.js']
                }
            }
        },
        jsdoc: {
            dist: {
                src: ['src/**/*.js'],
                options: {
                    destination: 'doc'
                }
            }
        },
        jsdoc2md: {
            oneOutputFile: {
                src: "src/**/*.js",
                dest: "doc/README.md"
            }
        },
        qunit: {
            all: ['test/**/*.html']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks("grunt-jsdoc-to-markdown");
    grunt.loadNpmTasks('grunt-contrib-qunit');

    grunt.registerTask('default', ['jshint', 'qunit', 'uglify', 'jsdoc', 'jsdoc2md']);
};
