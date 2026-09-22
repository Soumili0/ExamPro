# Spring Boot + Database Interview Q&A

---

## 🟩 SPRING BOOT

---

**Q1. What is Spring Boot? How is it different from Spring Framework?**

Spring Framework is a powerful but complex framework that requires a lot of manual configuration — XML files, bean definitions, dependency setup. Spring Boot is built on top of Spring Framework but eliminates all that boilerplate using **auto-configuration** and **convention over configuration**. It comes with an embedded server (Tomcat), so you don't need to deploy a WAR file — just run the JAR. In short, Spring Boot = Spring Framework + Auto Configuration + Embedded Server.

---

**Q2. What is `@SpringBootApplication`?**

It's a combination of three annotations:
- `@Configuration` — marks the class as a source of bean definitions
- `@EnableAutoConfiguration` — tells Spring Boot to auto-configure beans based on classpath
- `@ComponentScan` — scans the current package and sub-packages for Spring components

So putting `@SpringBootApplication` on the main class is enough to bootstrap the entire application.

---

**Q3. What is the difference between `@Component`, `@Service`, `@Repository`, and `@Controller`?**

All four are specializations of `@Component` — they all register the class as a Spring bean. The difference is semantic:
- `@Component` — generic Spring-managed component
- `@Service` — marks business logic layer (service classes)
- `@Repository` — marks data access layer; also enables automatic exception translation (converts DB exceptions to Spring's `DataAccessException`)
- `@Controller` — marks web layer (MVC controllers that return views)
- `@RestController` — `@Controller` + `@ResponseBody`, used for REST APIs returning JSON

---

**Q4. What is Dependency Injection and what types are there?**

Dependency Injection means instead of a class creating its own dependencies, Spring injects them. There are 3 types:

1. **Field Injection** — `@Autowired` on the field directly (easiest but not recommended for production)
2. **Constructor Injection** — dependencies passed through constructor (recommended — makes fields `final`, easier to test)
3. **Setter Injection** — `@Autowired` on a setter method (used for optional dependencies)

---

**Q5. What is the difference between `@Bean` and `@Component`?**

- `@Component` is placed on a class — Spring auto-detects it via component scan
- `@Bean` is placed on a method inside a `@Configuration` class — you manually control how the bean is created

Use `@Bean` when you need to configure a third-party class (one you can't annotate directly) or when you need custom initialization logic.

---

**Q6. What is `application.properties` used for?**

It's the central configuration file for a Spring Boot application. You can configure:
- Database connection (`spring.datasource.url`, `username`, `password`)
- Server port (`server.port`)
- JPA/Hibernate settings
- Custom properties (like `groq.api.key`, `gemini.api.key`)

Values can be injected into code using `@Value("${property.name}")`.

---

**Q7. What is `@Value` annotation?**

It injects a value from `application.properties` into a field. Example:
```java
@Value("${groq.api.key:}")
private String apiKey;
```
The `:` after the key name provides a default value if the property is not set.

---

**Q8. What is Spring Security?**

Spring Security is a framework that handles authentication (who are you?) and authorization (what can you do?) in Spring applications. It works through a chain of filters that intercept every HTTP request before it reaches the controller. In this project, `JwtRequestFilter` is added to this chain to validate JWT tokens on every request.

---

**Q9. What is `@Transactional`?**

It ensures that a method runs inside a database transaction. If the method completes successfully, the transaction is committed. If an exception is thrown, the transaction is rolled back — so partial changes don't remain in the database. It's important when a single operation involves multiple database writes that must all succeed or all fail together.

---

**Q10. What is the difference between `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`?**

They map HTTP methods to controller methods:
- `@GetMapping` — read data (GET request)
- `@PostMapping` — create new data (POST request)
- `@PutMapping` — update existing data (PUT request)
- `@DeleteMapping` — delete data (DELETE request)

They are shortcuts for `@RequestMapping(method = RequestMethod.GET/POST/PUT/DELETE)`.

---

**Q11. What is `@PathVariable` vs `@RequestParam` vs `@RequestBody`?**

- `@PathVariable` — extracts value from the URL path: `/api/students/{id}` → `@PathVariable Long id`
- `@RequestParam` — extracts value from query string: `/api/results?examId=1` → `@RequestParam Long examId`
- `@RequestBody` — extracts and deserializes the JSON body of the request into a Java object

---

**Q12. What is ResponseEntity?**

`ResponseEntity` represents the full HTTP response — status code, headers, and body. Using it gives you control over what HTTP status to return:
```java
return ResponseEntity.ok(data);                      // 200
return ResponseEntity.status(503).body(error);       // 503
return ResponseEntity.internalServerError().body(msg); // 500
```
Without it, Spring defaults to 200 for success and 500 for exceptions.

---

**Q13. What is auto-configuration in Spring Boot?**

Spring Boot looks at your classpath (what JARs you've added) and automatically configures beans based on what it finds. For example:
- If `spring-boot-starter-data-jpa` is on the classpath, it auto-configures a `DataSource`, `EntityManagerFactory`, and transaction manager
- If `spring-boot-starter-security` is on the classpath, it auto-configures a default security filter chain

You can override any auto-configured bean by defining your own — like we did with `SecurityConfig`.

---

**Q14. What is the difference between `@RequestMapping` at class level vs method level?**

At **class level**, it sets the base URL for all methods in that controller:
```java
@RequestMapping("/api/admin")
```
At **method level**, it sets the specific endpoint:
```java
@GetMapping("/students")  // full path: /api/admin/students
```

---

## 🟦 DATABASE (MySQL + JPA/Hibernate)

---

**Q15. What is JPA and what is Hibernate?**

JPA (Java Persistence API) is a **specification** — it defines how Java objects should be mapped to database tables. It's just an interface/standard.

Hibernate is an **implementation** of JPA. It's the actual ORM (Object-Relational Mapping) tool that does the work. Spring Boot uses Hibernate as the default JPA provider.

In simple terms: JPA = rules, Hibernate = the one who follows the rules.

---

**Q16. What is ORM?**

ORM stands for Object-Relational Mapping. It lets you work with database tables as Java objects instead of writing raw SQL. For example, the `User` entity class maps to the `user` table — each field maps to a column, each object instance maps to a row.

---

**Q17. What does `@Entity` and `@Table` do?**

- `@Entity` — marks a Java class as a JPA entity (maps to a database table)
- `@Table(name = "user")` — specifies the exact table name (optional — if not used, class name is used as table name)

---

**Q18. What is `@Id` and `@GeneratedValue`?**

- `@Id` — marks a field as the primary key
- `@GeneratedValue(strategy = GenerationType.IDENTITY)` — tells the database to auto-increment the ID value. The database handles ID generation, not the application.

---

**Q19. What is `spring.jpa.hibernate.ddl-auto`?**

It controls what Hibernate does with the database schema at startup:
- `create` — drops and recreates tables every time (data lost on restart)
- `create-drop` — creates on startup, drops on shutdown
- `update` — adds new columns/tables but doesn't delete existing ones ✅ (used in this project)
- `validate` — just checks schema matches entities, makes no changes
- `none` — does nothing

For development `update` is fine. For production `validate` or `none` is safer.

---

**Q20. What is the difference between Primary Key and Foreign Key?**

- **Primary Key** — uniquely identifies each row in a table. Cannot be null. Each table has one. Example: `user.id`
- **Foreign Key** — a column that references the primary key of another table, creating a relationship. Example: `answer.user_id` references `user.id`

---

**Q21. What are the types of SQL JOINs?**

- **INNER JOIN** — returns rows where there's a match in both tables
- **LEFT JOIN** — returns all rows from the left table + matched rows from right (nulls if no match)
- **RIGHT JOIN** — returns all rows from the right table + matched rows from left
- **FULL OUTER JOIN** — returns all rows from both tables

---

**Q22. What is the difference between `save()` and `saveAndFlush()` in JPA repositories?**

- `save()` — saves the entity but may batch the SQL — the actual INSERT/UPDATE might be delayed until the transaction commits
- `saveAndFlush()` — immediately writes the SQL to the database within the current transaction

In most cases `save()` is fine. `saveAndFlush()` is useful when you need to see the effect immediately within the same transaction.

---

**Q23. What is JPQL?**

JPQL (Java Persistence Query Language) is like SQL but works on **entity objects** instead of tables. Example:
```java
@Query("SELECT u FROM User u WHERE u.email = :email")
User findByEmail(@Param("email") String email);
```
Here `User` is the entity class, not the table name.

---

**Q24. What is the N+1 problem in JPA?**

If you fetch a list of 10 exams and each exam has questions, JPA might execute:
- 1 query to get all exams
- 10 separate queries to get questions for each exam = **11 queries total**

This is the N+1 problem. It kills performance. Solution is to use `JOIN FETCH` in JPQL or `@EntityGraph` to load related data in a single query.

---

**Q25. What is indexing in a database and why is it important?**

An index is a data structure that speeds up SELECT queries on a column. Without an index, MySQL scans every row to find matches (full table scan). With an index on `email`, finding a user by email is near-instant even with millions of rows.

Trade-off: indexes speed up reads but slow down writes (INSERT/UPDATE) slightly because the index must be updated too.

---

**Q26. What is the difference between `TRUNCATE` and `DELETE`?**

- `DELETE` — removes rows one by one, can have a `WHERE` clause, can be rolled back, triggers fire
- `TRUNCATE` — removes all rows at once, much faster, cannot have `WHERE` clause, cannot be rolled back in most databases, resets auto-increment counter

---

**Q27. What is a transaction in a database?**

A transaction is a group of operations that are treated as a single unit — either all succeed (commit) or all fail (rollback). It follows **ACID** properties:
- **A**tomicity — all or nothing
- **C**onsistency — data remains valid
- **I**solation — transactions don't interfere with each other
- **D**urability — committed data is permanently saved
