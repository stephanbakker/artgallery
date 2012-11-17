/*global module:false*/
module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({

        // source directory for copying
        staging: 'src',

        // copy files to
        output: 'dist',

        exclude : '.git* grunt.js',


        lint: {
            files: ['src/ui/js/*.js', 'src/ui/js/gallery/*.js']
        },

        css : {
            'dist/ui/css/gallery.min.css' : ['src/ui/css/base.css', 'src/ui/css/typography.css', 'src/ui/css/gallery.css']
        },

        concat: {
            dist: {
                src: ['src/ui/js/gallery/*.js'],
                dest: 'dist/ui/js/gallery.all.js'
            }
        },

        min: {
            dist: {
                src: ['dist/ui/js/gallery.all.js'],
                dest: 'dist/ui/js/gallery.min.js'
            }
        },

        jshint: {
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
        },
        uglify: {},
    });

    // Default task.
    //grunt.registerTask('default', 'lint qunit concat min');
    grunt.registerTask('default', 'copy lint concat css min');
};
