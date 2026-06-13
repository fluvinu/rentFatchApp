package com.rnt.rent.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.Map;

@Document(collection = "dataset")
public class Dataset {
    @Id
    private String id;
    private String name;
    private String description;
    private List<Map<String, Object>> fields;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<Map<String, Object>> getFields() { return fields; }
    public void setFields(List<Map<String, Object>> fields) { this.fields = fields; }
}
