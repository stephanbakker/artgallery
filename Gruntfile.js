/*global module:false*/
module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({

        pkg : grunt.file.readJSON('package.json'),


        cssmin : {
            combine : {
                files : {
                    'dist/ui/css/gallery.min.css' : ['src/ui/css/base.css', 'src/ui/css/typography.css', 'src/ui/css/gallery.css']
                }
            }
        },

        concat: {
            dist: {
                src: ['src/ui/js/gallery/*.js'],
                dest: 'dist/ui/js/gallery.all.js'
            }
        },

        uglify: {
            dist: {
                files: {
                    'dist/ui/js/gallery.min.js' : ['dist/ui/js/gallery.all.js']
                }
            }
        },

        jshint: {
            files: ['src/ui/js/*.js', 'src/ui/js/gallery/*.js'],
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true,
                browser: true,
                plusplus: false,
                strict: true
            },
            globals: {
                jQuery: true
            }
        }
        
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-concat');


    // Default task.
    //grunt.registerTask('default', 'lint qunit concat min');
    grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'cssmin']);
};
