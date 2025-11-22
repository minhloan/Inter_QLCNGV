package com.example.teacherservice.model;
import com.example.teacherservice.enums.TrialAttendeeRole;
import jakarta.persistence.*;
import lombok.*;
@Entity
@Table(name = "trial_attendees", indexes = {
        @Index(name = "idx_trial_id", columnList = "trial_id")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrialAttendee extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trial_id", nullable = false)
    private TrialTeaching trial;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attendee_user_id")
    private User attendeeUser;
    @Column(name = "attendee_name", length = 100)
    private String attendeeName;
    @Enumerated(EnumType.STRING)
    @Column(name = "attendee_role")
    private TrialAttendeeRole attendeeRole;

    // Optional: Nếu muốn từ Attendee lấy được danh sách các bài đánh giá họ đã làm (thường là 1)
    // @OneToMany(mappedBy = "evaluator", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    // private List<TrialEvaluation> evaluations;
}