export class RecordFile {
    constructor(address) {
        this.address = address;
        this.name = "";
        this.lastName = "";
        this.birthDate = "";
        this.bloodType = "";
        this.recentRecordUpdate = new Date().toLocaleString();;
        this.records = [];
    }
}

export class RecordData {
    constructor(doctorId, title, data) {
        this.doctorId = doctorId;
        this.title = title;
        this.data = data;
        this.date = new Date().toLocaleString();
    }
}