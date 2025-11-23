package com.example.teacherservice.model;
import com.example.teacherservice.enums.TrialAttendeeRole;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;
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

    @OneToMany(mappedBy = "attendee", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<TrialEvaluation> evaluations;
}