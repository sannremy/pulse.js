module.exports = function(grunt) {

    grunt.initConfig({
        jshint: {
            files: ['Gruntfile.js', 'src/**/*.js']
        },
        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint', 'uglify:js_minify', 'jsdoc']
        },
        uglify: {
            js_minify: {
                files: {
                    'pulse.min.js': ['src/**/*.js']
                }
            }
        },
        jsdoc: {
            dist: {
                src: ['src/*.js'],
                    options: {
                    destination: 'doc'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-jsdoc');

    grunt.registerTask('default', ['jshint', 'uglify', 'jsdoc']);
};
