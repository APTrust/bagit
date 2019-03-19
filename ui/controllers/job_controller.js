const { BagItProfile } = require('../../bagit/bagit_profile');
const { BaseController } = require('./base_controller');
const { Context } = require('../../core/context');
const { Job } = require('../../core/job');
const { JobFileUIHelper } = require('../common/job_file_ui_helper');
const { JobPackagingUIHelper } = require('../common/job_packaging_ui_helper');
const { JobForm } = require('../forms/job_form');
const { JobPackageOpForm } = require('../forms/job_package_op_form');
const Templates = require('../common/templates');

const typeMap = {
    limit: 'number',
    offset: 'number',
}

class JobController extends BaseController {

    constructor(params) {
        super(params, 'Jobs');
        this.typeMap = typeMap;

        this.model = Job;
        this.formClass = JobForm;
        //this.formTemplate = Templates.jobForm;
        this.listTemplate = Templates.jobList;
        this.nameProperty = 'name';
        this.defaultOrderBy = 'createdAt';
        this.defaultSortDirection = 'desc';
    }

    new() {
        let job = new Job();
        job.save();
        this.params.set('id', job.id);
        return this.files();
    }

    files() {
        let job = Job.find(this.params.get('id'));
        let errors = '';  //this._getPageLevelErrors(job);
        let data = {
            alertMessage: this.alertMessage,
            job: job
        }
        this.alertMessage = null;
        let html = Templates.jobFiles(data);
        return this.containerContent(html);
    }

    packaging() {
        let job = Job.find(this.params.get('id'));
        let errors = '';  //this._getPageLevelErrors(job);
        let form = new JobPackageOpForm(job);
        let data = {
            alertMessage: this.alertMessage,
            alertCssClass: this.alertCssClass,
            job: job,
            form: form
        }
        this.alertMessage = null;
        let html = Templates.jobPackaging(data);
        return this.containerContent(html);
    }

    _updatePackaging(withValidation) {
        this.alertMessage = '';
        let job = Job.find(this.params.get('id'));
        let form = new JobPackageOpForm(job);
        form.parseFromDOM();
        job.packageOp.packageFormat = form.obj.packageFormat;
        job.packageOp.pluginId = form.obj.pluginId;
        job.bagItProfile = BagItProfile.find(form.obj.bagItProfileId);
        job.packageOp.outputPath = form.obj.outputPath;
        job.packageOp.packageName = form.obj.packageName;
        job.save();
        if (withValidation) {
            let errors = [];
            if (job.packageOp.packageFormat == 'BagIt' && !job.bagItProfile) {
                errors.push(Context.y18n.__("When choosing BagIt format, you must choose a BagIt profile."));
            }
            if (!job.packageOp.outputPath) {
                errors.push(Context.y18n.__("You must specify an output path."));
            }
            if (job.packageOp.packageName) {
                errors.push(Context.y18n.__("You must specify a package name."));
            }
            if (errors.length) {
                this.alertMessage = `<ul><li>${errors.join('</li><li>')}</li></ul>`;
                this.alertCssClass = 'alert-danger';
            }
        }
    }


    // User clicked Back button from packaging page.
    // Save work without validating.
    backToFiles() {
        console.log('backToFiles')
        this._updatePackaging(false);
        return this.packaging();
    }

    // User clicked Next button from packaging page.
    postPackaging() {
        console.log('postPackaging')
        this._updatePackaging(true);
        let job = Job.find(this.params.get('id'));
        if (this.alertMessage) {
            // Errors. Stay on packaging screen.
            return this.packaging();
        }
        else if (job.packageOp.packageFormat == 'BagIt') {
            alert('Next is bag metadata form');
            return this.noContent();
        } else {
            alert('Next is upload form');
            return this.noContent();
        }
    }

    // update() {
    //     return this.containerContent('Update Job');
    // }

    list() {
        let listParams = this.paramsToHash();
        listParams.orderBy = listParams.sortBy || this.defaultOrderBy;
        listParams.sortDirection = listParams.sortOrder || this.defaultSortDirection;
        let jobs = Job.list(null, listParams);
        this.colorCodeJobs(jobs);
        let data = {
            alertMessage: this.alertMessage,
            items: jobs
        };
        let html = this.listTemplate(data);
        return this.containerContent(html);
    }

    /**
     * This adds some custom display properties to each jobs hash
     * so we can color-code the display.
     */
    colorCodeJobs(jobs) {
        for(let i=0; i < jobs.length; i++) {
            let job = Job.inflateFrom(jobs[i]);
            job.pkgDate = '-';
            job.valDate = '-';
            job.uploadDate = '-';
            if (job.packageAttempted()) {
                job.pkgColor = (job.packageSucceeded() ? 'text-success' : 'text-danger');
                job.pkgDate = dateFormat(job.packagedAt(), 'shortDate');
            }
            if (job.validationAttempted()) {
                job.valColor = (job.validateSucceeded() ? 'text-success' : 'text-danger');
                job.valDate = dateFormat(job.validatedAt(), 'shortDate');
            }
            if (job.uploadAttempted()) {
                job.uploadColor = (job.uploadSucceeded() ? 'text-success' : 'text-danger');
                job.uploadDate = dateFormat(job.uploadedAt(), 'shortDate');
            }
            jobs[i] = job;
        }
    }

    // destroy() {
    //     return this.containerContent('Destroy Job');
    // }

    postRenderCallback(fnName) {
        if (fnName == 'new' || fnName == 'files') {
            let job = Job.find(this.params.get('id'));
            let helper = new JobFileUIHelper(job);
            helper.initUI();
        } else if (fnName == 'packaging') {
            let job = Job.find(this.params.get('id'));
            let helper = new JobPackagingUIHelper(job);
            helper.initUI();
        }
    }
}

module.exports.JobController = JobController;
