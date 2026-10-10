package com.tesotter_crm_erick.tesotter_crm_erick.repository;
import com.tesotter_crm_erick.tesotter_crm_erick.domain.CrmTask;
import org.springframework.data.mongodb.repository.MongoRepository;
public interface CrmTaskRepository extends MongoRepository<CrmTask,String> {}
