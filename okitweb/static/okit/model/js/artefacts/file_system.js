/*
** Copyright (c) 2020, 2021, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded File System Javascript');

/*
** Define File System Class
*/
class FileSystem extends OkitArtifact {
    /*
    ** Create
    */
    constructor (data={}, okitjson={}) {
        super(okitjson);
        // Configure default values
        // this.display_name = this.generateDefaultName(okitjson.file_systems.length + 1);
        this.compartment_id = data.parent_id;
        this.availability_domain = 1;
        this.kms_key_id = '';
        this.source_snapshot_id = '';
        // Update with any passed data
        this.merge(data);
        this.convert();
    }
    /*
    ** Clone Functionality
    */
    clone() {
        return new FileSystem(JSON.clone(this), this.getOkitJson());
    }
    /*
    ** Name Generation
    */
    getNamePrefix() {
        return super.getNamePrefix() + 'fs';
    }
    /*
    ** Static Functionality
    */
    static getArtifactReference() {
        return 'File System';
    }
}
/*
** Dynamically Add Model Functions
*/
OkitJson.prototype.newFileSystem = function(data) {
    this.getFileSystems().push(new FileSystem(data, this));
    return this.getFileSystems()[this.getFileSystems().length - 1];
}
OkitJson.prototype.getFileSystems = function() {
    if (!this.file_systems) {
        this.file_systems = [];
    }
    return this.file_systems;
}
OkitJson.prototype.getFileSystem = function(id='') {
    for (let artefact of this.getFileSystems()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
return undefined;
}
OkitJson.prototype.deleteFileSystem = function(id) {
    this.file_systems = this.file_systems ? this.file_systems.filter((r) => r.id !== id) : []
}

