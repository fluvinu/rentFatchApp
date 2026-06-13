package com.rnt.rent.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Map;

@Document(collection = "record")
public class Record {
    @Id
    private String id;
    private String datasetId;
    private Map<String, Object> data;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getDatasetId() { return datasetId; }
    public void setDatasetId(String datasetId) { this.datasetId = datasetId; }

    public Map<String, Object> getData() { return data; }
    public void setData(Map<String, Object> data) { this.data = data; }
}
